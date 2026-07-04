# Terraform — EKS Cluster Provisioning (AWS)

Provisions a production-style AWS EKS platform using only custom modules. No third-party or registry modules are used.

## Prerequisites

- Terraform >= 1.10.0
- AWS CLI configured (`aws configure`)
- An S3 bucket for remote state (created once manually — see below)

## Bootstrap Remote State (one-time)

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws s3api create-bucket \
  --bucket "uptime-monitor-tfstate-${ACCOUNT_ID}" \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1

aws s3api put-bucket-versioning \
  --bucket "uptime-monitor-tfstate-${ACCOUNT_ID}" \
  --versioning-configuration Status=Enabled
```

We may place a RANDOM UNIQUE number instead ACCOUNT_ID to make the bucket unique.

## Usage

```bash
terraform init
terraform plan -var="db_username=admin" -var="db_password=yourpassword"
terraform apply -var="db_username=admin" -var="db_password=yourpassword"
```

Sensitive variables (`db_username`, `db_password`) must be passed at runtime — never stored in `.tf` files.

## Module Structure

```
modules/
  vpc/         VPC, public/private subnets, IGW, NAT gateway, route tables
  eks/         EKS cluster, node group, IAM roles, security groups
  ecr/         ECR repositories for frontend and backend with lifecycle policies
  rds/         Private PostgreSQL RDS, subnet group, security group (EKS-only access)
  cloudwatch/  Log group for EKS control plane, CPU and memory alarms
```

## Infrastructure Design

### Network Layout

```
VPC 10.0.0.0/16
  Public subnets  (10.0.0.0/24, 10.0.1.0/24)  — load balancers only
  Private subnets (10.0.10.0/24, 10.0.11.0/24) — EKS nodes + RDS
```

- EKS worker nodes run in **private subnets** — they have no public IPs.
- Outbound internet access for nodes goes through the NAT gateway in the public subnet.
- RDS is in the same private subnets and is only reachable from the EKS node security group on port 5432.

---

## Task 5 Questions' Answers

### How to safely upgrade EKS

When I need to upgrade EKS, I first check the AWS release notes for the target version. I update my `kubernetes_version` variable to the next minor version, making sure never to skip versions (like going straight from 1.31 to 1.33). Then, I run a `terraform plan` to double-check that only the cluster version is changing. I run `terraform apply` to upgrade the control plane first. Once that's done, I update the node group AMI with another `apply`, which triggers a rolling update replacing one node at a time. Finally, I just verify everything is running fine using `kubectl get nodes` and `kubectl get pods -A`.

### How to add or resize node pools

To resize a node pool, I simply change the `node_count` or `node_size` variables and run `terraform apply`. Before that I may check using `terraform plan`. I use a lifecycle block with `ignore_changes = [scaling_config[0].desired_size]` so Terraform doesn't mess with the sizes managed by the cluster autoscaler. If I need to add a brand new node group, like for spot instances, I just add a new `aws_eks_node_group` resource inside my EKS module.

### How to maintain Terraform state

I keep the Terraform state in an S3 bucket with versioning turned on also set use_lockfile as true to handle lock. This stops two people from running an `apply` at the same time and breaking things. I make it a strict rule to never edit the `terraform.tfstate` file manually. Instead, I use commands like `terraform state list` or `terraform state show` to look at the state, and `terraform state mv` if I need to rename a resource without destroying it. I also run `terraform plan` regularly just to catch any drift between the state file and the actual infrastructure.

### How to avoid downtime during cluster changes

To avoid downtime, I configure the node group to replace only one node at a time using `max_unavailable = 1`. On the application side, I make sure my Kubernetes deployments have `PodDisruptionBudgets` and at least two replicas so the app stays up while nodes are drained. For control plane upgrades, AWS handles the high availability, so that part doesn't cause any downtime for my workloads.

### How to separate dev, staging, and production

I keep environments fully isolated by using different state files and passing an environment variable. For example, for the dev environment, I run `terraform apply` with `-var="environment=dev"` and point the backend to a `dev/terraform.tfstate` key. I do the exact same thing for staging and production using their respective keys. This way, each environment gets its own completely separate VPC, EKS cluster, and database.

### How to handle secrets outside Terraform code

I mark variables like the database username and password as `sensitive = true` in Terraform so they don't show up in the console logs. I never commit them in `.tfvars` files. Instead, I pass them as environment variables (like `TF_VAR_db_password`) when running Terraform, or store them in GitHub Secrets or AWS Secrets Manager if I'm using a CI/CD pipeline. Once the database is up, I keep the credentials in AWS Secrets Manager and use something like External Secrets Operator in Kubernetes to pull them directly into the pods, keeping Terraform out of the runtime secret management entirely.

### What to check if Terraform wants to recreate the cluster

If I see a `terraform plan` trying to replace the EKS cluster or the database, that's a huge red flag. I usually check a few specific things: First, did the Kubernetes version change by more than one minor version? EKS doesn't allow skipping versions. Second, did the subnet IDs change? You can't change those after creation. I also check if the endpoint access settings changed, or if someone tried to change the storage encryption on the RDS instance, since those also trigger replacements. Sometimes it's just state drift because someone made a manual change in the AWS console, so I'll run `terraform refresh` to sync things up. If a replacement is actually unavoidable, I make sure to schedule a maintenance window and take a database snapshot before applying anything.
