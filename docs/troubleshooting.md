# Troubleshooting Questions

### 1. Pod is in CrashLoopBackOff. What do you check?

First I run `kubectl logs <pod-name> -n <namespace>` to see what error the app is throwing. Most of the time its a missing env variable, a wrong secret value, or the app crashing on startup. I also check `kubectl describe pod <pod-name>` to see if there's an image pull error or an OOM kill. That covers 90% of cases.

### 2. Deployment is successful, but app is not reachable. What do you check?

I check if the pods are actually running using `kubectl get pods`. Then I check if the service selector matches the pod labels. A lot of times the deployment says `app: backend` but the service selector says something slightly different. I also check if the ingress is configured correctly and if the ingress controller is actually running in the cluster. Sometimes I also missmatch the port of the service, or NGINX config, so I check them also.

### 3. Difference between readiness and liveness probe?

**Readiness probe** decides if the pod should receive traffic. If it fails, the pod stays running but gets removed from the load balancer rotation.
**Liveness probe** decides if the pod is alive. If it fails, kubernetes restarts the pod.

### 4. Docker build works locally but fails in pipeline. Why?

Usually we face one of these, the pipeline doesn't have access to a private package registry, the base image version is different, package issue like packages supported the local machine but not the cloud machine we selected for pipeline, or there's a file that exists locally but is ignored via **.dockerignore** that the build actually needs. Sometimes its also a platform mismatch, like building on arm locally but pipeline runs on x86.

### 5. Pipeline fails during Docker build. What do you check?

I look at the exact error in the pipeline logs first. Then I check if the base image is still available (sometimes images get deleted), if there are any network issues pulling dependencies, and if the Dockerfile references any build args or secrets that aren't being passed in the pipeline.

### 6. Certificate renewal failed. What do you check?

I check if cert-manager is running and if the Certificate resource shows any error in its status (`kubectl describe certificate`). Usually its a DNS challenge failing, meaning the domain can't be verified.

### 7. Ingress returns 502 or 504. What do you check?

502 usually means the ingress can reach the service but the service can't reach the pods, so I check if pods are running and healthy. 504 means its timing out, usually the app is too slow to respond or the pod is overloaded or sometimes we've restrictions for file upload limits. I check pod logs, resource usage, and also the ingress timeout annotations. In our case the timeout is set to 60s in the ingress config.

### 8. Vendor SFTP connection to port 22 times out. What do you check?

I check if port 22 is open in the security group or firewall rules for the server the vendor is trying to reach. Then I check if the SFTP server is actually running. I also check if there's a network ACL or VPC rule blocking outbound/inbound traffic on that port. Sometimes the vendor's IP also needs to be whitelisted.

### 9. Terraform plan wants to recreate the cluster. What do you check?

I look at exactly what changed in the plan output. Usually its the subnets, kubernetes version, or some immutable field that got changed. I also check if someone manually modified something in AWS console that caused a state drift. Before doing anything I run `terraform plan` carefully and make sure I understand what's going to be destroyed. If its something critical like the EKS cluster or RDS, I pause and figure out how to make the change without recreation, or plan a maintenance window.

### 10. How would you upgrade AKS/EKS safely?

I upgrade one minor version at a time, never skip versions. First I upgrade the control plane, then the node groups. I make sure there are pod disruption budgets in place so pods don't all go down at once. I also test the new version in a dev or staging environment first. For EKS specifically, I update the `kubernetes_version` in Terraform and apply, then update the node group ami type and apply again. I watch pod status throughout with `kubectl get pods -A -w`.

### 11. Frontend loads, but backend API calls fail. What do you check?

First I check if the backend pods are running. Then I check if the backend service name and port match what the frontend is calling. In our case the frontend uses `http://backend-service:8080` which is the internal K8s DNS. I also check if the API key is correct because my application backend rejects requests without the right key. I check backend pod logs to see if any requests are even reaching it.

### 12. Backend pod is running, but database connection times out. What do you check?

I check if the RDS instance is running and in the same VPC. Then I check the security group, the RDS security group should allow port 5432 from the EKS node security group. I also check if the DB_HOST env variable in the pod is correct (it should be the private RDS endpoint). And I check if the DB credentials are right. Sometimes its just the wrong hostname or a typo in the secret value.

### 13. Private DNS is not resolving database hostname. What do you check?

I check if the VPC has DNS support enabled (`enableDnsSupport` and `enableDnsHostnames` both should be true). In our Terraform setup these are explicitly set to `true` in the VPC resource. I also check if the pod is in the right VPC. If somehow a pod ended up outside the VPC, it wouldn't resolve private DNS names. I run `nslookup` or `dig` from inside the pod to test.

### 14. How would you rotate database credentials safely?

I create a new password first without deleting the old one. Then I update the Kubernetes secret with the new password using:

```bash
kubectl create secret generic backend-secret --from-literal=DB_USERNAME=<new-username-if-need> --from-literal=DB_PASSWORD=<new-password> --namespace=uptime-monitor --dry-run=client -o yaml | kubectl apply -f -
```

Then I do a rolling restart of the backend deployment so pods pick up the new secret using `kubectl rollout restart deployment/backend`. Once everything is running fine, I update the actual RDS password to match. And this way there's no downtime.

### 15. Secrets were accidentally committed to GitHub. What do you do?

First, I change or disable the leaked password or API key right away, so it becomes completely useless. This is the most important step.
After that, I remove the secret from the code. But just deleting it and making a new commit isn't enough, because anyone can still see it in the older git history. To fix this, I use a tool like **git-filter-repo** to completely erase it from all past commits, and then force push the clean history to GitHub.
Finally, I check GitHub's secret scanning alerts or system logs to see if anyone actually tried to use the leaked key, and I let my team know what happened so everyone is on the same page.
