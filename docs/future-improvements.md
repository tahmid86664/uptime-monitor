# Future Improvements

### 1. Secret Management with AWS Secrets Manager

Right now secrets are created by the pipeline using GitHub Secrets. Its fine but if someone needs to rotate a secret they have to update GitHub Secrets and redeploy. With AWS Secrets Manager, secrets can be rotated in one place and the cluster picks them up automatically.
WE need to install External Secrets Operator in the cluster. Create secrets in AWS Secrets Manager. The operator syncs them into Kubernetes Secrets automatically.

### 2. Kubernetes Autoscaling (HPA)

I will add Horizontal Pod Autoscaler to scale pods up and down based on CPU or memory usage.
Right now replicas are fixed at 2. If traffic spikes, the app might slow down or crash. HPA automatically adds more pods when needed and scales back down when load drops.
It will reduce the risk of downtime during traffic spikes without paying for extra pods 24/7.

### 3. Production Approval Gate in Pipeline

Will add a manual approval step before deploying to production.
Currently every push to main deploys straight to production. If someone merges a bad PR, it goes live immediately. An approval step lets someone review the build output before it hits production.
Like, GitHub Actions supports `environment` with required reviewers. I need to set up a `production` environment and add approvers, the pipeline pauses until someone approves.

### 4. Alerting for CloudWatch Alarms

Will connect the CloudWatch alarms to SNS so the team gets notified when CPU or memory is too high.
The CloudWatch alarms are already set up in Terraform but they don't actually notify anyone currently. Without notifications the alarms are basically useless.
I will add an `aws_sns_topic` and `aws_sns_topic_subscription` in Terraform and connect them to the existing alarms. Subscribe an email or Slack or Discord webhook.

## 5. Rollback Strategy

Will introduce a rollback process for failed deployments.
Right now if a bad image gets deployed, rolling back requires manually running kubectl commands. There's no documented process and no automation for it.
