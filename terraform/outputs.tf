output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster API server endpoint"
  value       = module.eks.cluster_endpoint
}

output "ecr_frontend_url" {
  description = "ECR repository URL for the frontend image"
  value       = module.ecr.frontend_repository_url
}

output "ecr_backend_url" {
  description = "ECR repository URL for the backend image"
  value       = module.ecr.backend_repository_url
}

output "vpc_id" {
  description = "VPC network ID"
  value       = module.vpc.vpc_id
}

output "rds_endpoint" {
  description = "Private RDS endpoint — never publicly accessible"
  value       = module.rds.db_endpoint
  sensitive   = true
}
