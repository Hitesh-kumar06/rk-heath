# Security Policy

## Supported Versions

Only the latest `main` branch receives security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in RK Health, please **do not** open a public GitHub issue.

Instead, report it privately by emailing the maintainers or using GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) feature.

Please include:

- A clear description of the issue
- Steps to reproduce
- Potential impact
- Any suggested remediation

We aim to acknowledge reports within **72 hours** and provide a fix or mitigation timeline within **7 days**.

## Handling of Health Data

RK Health stores user-entered health information (appointments, medications, notes). All data is:

- Isolated per user via Postgres Row Level Security (RLS)
- Transmitted over HTTPS
- Never shared with third parties beyond the AI provider used to generate visit summaries

This project is a demo / educational platform and is **not** HIPAA-certified. Do not use it to store protected health information (PHI) in production without a proper compliance review.
