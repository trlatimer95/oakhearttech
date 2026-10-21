---
title: 'Turning around software with hundreds of open defects'
client: 'Industrial equipment manufacturer'
service: 'Software Rescue'
origin: 'employee'
seoTitle: 'Turning Around Troubled Software'
seoDescription: 'A software rescue case study: 300+ open defects, ranked by customer pain and fixed in order, until new reports nearly stopped.'
summary: 'Machine-control software had a long list of open defects and a backlog that was hurting customers. I took over as the only engineer in the code, fixed what mattered most first, and new reports nearly stopped.'
problem: 'More than 300 open defects, at least 50 of them critical or at risk of losing a customer. Machines weren''t doing things that were critical to production, and customer satisfaction was a priority.'
fix: 'I learned the software and the hardware it drives. A long-serving staff engineer handled customer communication and decided what the correct result should be, while I worked in the code. Together we ranked every issue by customer pain, safety and production impact, and I fixed them in that order. One of the biggest wins was finding why boards got stuck during handoffs inside the machine.'
result: 'Most of the critical issues were resolved within about six months, and I fixed 200+ defects over my time on the software. Customer satisfaction improved, and new issue reports almost stopped.'
draft: false
order: 2
---

## Starting point

The software controlled industrial machines used in electronics manufacturing: a C# desktop application talking to
motion controllers, sensors, conveyors and other hardware. It had more than 300 open defects, and at least 50 were
critical or at risk of losing a customer.

## How I decided what to fix

I was the only engineer in the code. A long-serving staff engineer handled customer communication and determined what
the correct result should be, and we ranked issues together in a deliberate order:

1. **Customer pain.** What was making customers most unhappy.
2. **Safety and production failures.** Anything that could stop a customer's line.
3. **Efficiency and everything else.**

Many of the issues were things the machine simply wasn't doing that were critical to production, so fixing them
changed customers' day-to-day immediately.

## The fix that made the biggest difference

On a line with several stages, a board is passed from one stage to the next. Occasionally one stage tried to hand a
board over and the next failed to receive it, leaving the board stuck in the machine and stopping production. I worked
out exactly how the handoff was being done, where it could fail, and made it reliable. Production stops from that
cause were a major source of customer complaints.

## What changed

- Most of the critical issues were resolved within about six months.
- Over my time on the software I fixed 200+ defects, then moved on to implementing requested features.
- Customer satisfaction increased, and new issue reports almost completely stopped.

## What this means for you

If your software has a long list of problems and nobody can say what to fix first, the answer is usually not to start
over. It's to rank by what costs you most and work down. That's what Software Rescue does.
