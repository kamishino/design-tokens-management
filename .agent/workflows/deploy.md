---
description: Deploy - Infrastructure deployment with Docker, CI/CD, and monitoring
---

# /deploy — Production Deployment Workflow

Deploy applications to production with zero-downtime strategy.

// turbo

1. **Pre-Deploy Checks**
   - All tests pass on CI.
   - No critical security vulnerabilities (`npm audit` / `pip audit`).
   - Environment variables configured for target environment.
   - Database migrations ready (if applicable).

2. **Build**
   - Build production artifacts: `npm run build` / `docker build`.
   - Verify Docker image size and layers.
   - Tag with semantic version.

// turbo

3. **Deploy to Staging**
   - Push to staging environment.
   - Run smoke tests against staging.
   - Verify health checks pass.
   - 🛑 STOP & WAIT: User verifies staging.

4. **Deploy to Production**
   - Use blue-green or rolling deployment.
   - Monitor error rates during rollout.
   - Verify health checks pass on production.

// turbo

5. **Post-Deploy**
   - Tag release in git: `git tag v<version>`.
   - Update CHANGELOG.md.
   - Notify team (Slack, Discord, email).
   - Monitor dashboards for 15 minutes post-deploy.

6. **Rollback Plan**
   - If error rate exceeds threshold: rollback to previous version.
   - Document incident if rollback occurs.
