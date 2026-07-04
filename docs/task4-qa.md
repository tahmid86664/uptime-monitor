# Task 4: Private Database Connectivity

### What I'm Using

I'm using **AWS RDS PostgreSQL** as the private database. It's provisioned through Terraform under `terraform/modules/rds/`. The actual backend application in this project is a monitoring tool and doesn't connect to a database directly but I've treated the database as part of the infrastructure design. The RDS setup is fully provisioned in Terraform, and the credentials are referenced in the Kubernetes secret example (`k8s/backend-secret-example.yml`) to show how the backend would securely receive them.

### How EKS Connects Privately to the Database

The EKS worker nodes and the RDS instance are both placed in the same **private subnets** inside the VPC. So when a backend pod tries to reach the database, the traffic stays completely inside the VPC, it never touches the public internet. The RDS endpoint is just a private DNS name that only resolves within the VPC.

### Private Subnet and Endpoint Design

I put both the EKS nodes and RDS in **private subnets** (`10.0.10.0/24` and `10.0.11.0/24`). These subnets have no direct route to the internet. The outbound traffic goes through a NAT Gateway, and there's no inbound path from outside. RDS has no public IP at all (`publicly_accessible = false`).

### Private DNS Requirement

RDS gives a private DNS hostname like `production-postgres.xxxx.ap-southeast-1.rds.amazonaws.com`. This hostname only resolves inside the VPC. AWS handles this automatically. I just enable `enable_dns_hostnames = true` and `enable_dns_support = true` on the VPC, and it works.

### Security Group Rules

I created a dedicated security group for RDS that only allows **port 5432 (PostgreSQL) from the EKS node security group**. Nothing else can reach it, not my laptop, not the internet, not even other services in the VPC unless they're part of the EKS node group.

```
EKS node security group → port 5432 → RDS security group  ✅
Anything else           → port 5432 → RDS security group  ❌
```

### How Only the Backend Can Access the Database

The RDS security group only trusts the **EKS node security group** as the source. So only pods running on those nodes can reach port 5432. On top of that, the database requires a username and password, even if someone somehow got network access, they'd still need credentials.

### How Database Credentials Are Stored Securely

I don't put credentials in code or config files. In Kubernetes, they go into a **Secret** (`backend-secret`). The CI/CD pipeline creates this secret at deploy time by reading from **GitHub Secrets** so the values only exist in GitHub's encrypted secret store and inside the K8s cluster. They're never written to any file or visible in logs.

### How to Confirm the Database Is Not Publicly Accessible

Two ways:

1. **Check in AWS Console:** Go to RDS --> the instance --> Connectivity. It will say `Publicly accessible: No`.

2. **Check via AWS CLI:**

```bash
aws rds describe-db-instances --db-instance-identifier production-postgres --query 'DBInstances[0].PubliclyAccessible'
# It should return: false
```

If we try to connect to the RDS hostname from outside the VPC, it won't resolve, because the DNS name only works inside the VPC.
