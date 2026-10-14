---
title: 'Turning around software that customers were ready to walk away from'
client: 'Industrial equipment manufacturer (anonymized)'
service: 'Project Rescue'
summary: 'Customers were unhappy with the software running their machines, and some were leaving. I took over as the sole engineer, fixed the issues that hurt most first, and new reports nearly stopped.'
problem: 'More than 300 open defects, at least 50 of them critical or at risk of losing a customer. Machines were failing to do things critical to production, and some customers were returning machines worth tens of thousands of dollars each.'
fix: 'I learned the software and the hardware it drives, worked with a senior engineer to rank every issue by customer pain, safety and production impact, and fixed in that order. One of the biggest wins was finding why boards got stuck during handoffs inside the machine.'
result: 'The critical issues were resolved within about six months, 200+ defects were fixed overall, customer satisfaction improved, and new issue reports almost stopped.'
draft: true
order: 2
---

This is a draft. Keep the company, product and people anonymized, and keep the wording about prior support neutral.

## Starting point

The software controlled industrial machines used in electronics manufacturing: a C# desktop application talking to
motion controllers, sensors, conveyors and other hardware. It had more than 300 open defects, and at least 50 were
critical or at risk of losing a customer. Some customers were already leaving and returning their machines.

## How I decided what to fix

I worked with a long-serving staff engineer, and we ranked issues in a deliberate order:

1. **Customer pain.** What was making customers most unhappy.
2. **Safety and production failures.** Anything that could stop a customer's line.
3. **Efficiency and everything else.**

Many of the issues were things the machine simply was not doing that were critical to production, so fixing them
changed customers' day-to-day immediately.

## The fix that made the biggest difference

On a line with several stages, a board is passed from one stage to the next. Occasionally one stage tried to hand a
board over and the next failed to receive it, leaving the board stuck in the machine and stopping production. I worked
out exactly how the handoff was being done, where it could fail, and made it reliable. Production stops from that
cause were a major source of customer complaints.

## What changed

- The critical issues were resolved within about six months.
- 200+ defects were fixed in total, then I moved on to implementing requested features.
- Customer satisfaction increased, and new issue reports almost completely stopped.

## What this means for you

If your software has a long list of problems and nobody can say what to fix first, the answer is usually not to start
over. It is to rank by what costs you most and work down. That is what Project Rescue does.
