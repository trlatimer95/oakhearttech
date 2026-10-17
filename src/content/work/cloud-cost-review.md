---
title: 'Significantly reducing cloud spend on a commerce platform'
client: 'Commerce platform company'
service: 'Software & Subscription Cost Review'
origin: 'employee'
summary: 'I went through a commerce platform''s Azure environment resource by resource, removed what was unused and lowered over-provisioned tiers, and significantly reduced monthly cloud spend.'
problem: 'The cloud bill had grown with unused and over-provisioned resources, and nobody had gone through it line by line.'
fix: 'I walked through the environment resource by resource. I removed anything unused and moved anything over-provisioned to a lower tier, after checking what depended on it.'
result: 'Monthly cloud spend was significantly reduced, with nothing the platform relied on switched off by mistake.'
draft: false
order: 4
---

## The starting point

The platform runs on Azure and serves a large user base through many supplier integrations. Over time the monthly
cloud bill had grown faster than the business needed.

## What I did

- **Inventory.** Listed every resource, what it cost and what depended on it.
- **Removal.** Removed what was unused.
- **Right-sizing.** Moved anything over-provisioned to a lower tier.
- **Alongside the cost work,** I also took failing automated compliance checks one by one and implemented the technical
  changes in Azure that each one required.

## What changed

- Monthly Azure spend was significantly reduced.
- Nothing the platform relied on was switched off by mistake, because each change was checked first.

## Why it matters for small business

Small shops overspend on software and cloud too, just at a smaller scale. The same walkthrough, line by line, works
for a $250 monthly bill as well as a $25k one. It's the heart of the Software & Subscription Cost Review, with cloud
resources as an add-on.
