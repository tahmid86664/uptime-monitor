### Question: Explain how secrets should be stored safely using GitHub Secrets, Jenkins credentials, Azure DevOps variable groups, Azure Key Vault, or AWS Secrets Manager.

I've used GitHub Secrets, as I'm using Github Actions for CI/CD, so it's easy to manage. When the pipeline runs, it needs sensitive information like cloud access keys or backend secrets to complete its job. Instead of typing these directly into the code or kubernetes configuration files which is very dangerous because anyone with access to the code can see them, I save them in the repository settings as Secrets.
Once a secret is saved, GitHub encrypts it. Even if I go back to look at the settings, I can't read the password anymore; I can only update or delete it. Also, if the pipeline accidentally prints the password in the output logs during a run, GitHub will automatically mask it and show \*\*\* instead.
This way, the application securely fetches the password exactly when it needs it, and we don't have to pass database credentials through the CI/CD pipeline at all.
I can also use the other credentials vault system but for this project GitHub Secrets is well aligned, so I've used it.
