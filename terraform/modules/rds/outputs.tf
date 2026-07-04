output "db_endpoint" {
  description = "RDS instance endpoint (private — only reachable from EKS nodes)"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}
