---
title: 'A multiplayer VR simulator for emergency medical training'
client: 'Confidential client'
service: 'Interactive & VR Training'
origin: 'contract'
summary: 'A virtual simulator that lets fire departments recreate real calls and practice working through them together. I’m the sole developer, building it in Unity with networked multiplayer.'
problem: 'Emergency medical skills are hard to practice realistically and repeatably, and departments want to rehearse the specific calls they actually run, as a team.'
fix: 'I designed and built the simulator in Unity and C#, with networked multiplayer on Photon Fusion and an outside artist for models. I own the code, the multiplayer sync, the interactions and performance.'
result: 'In development for several years and planned for fire department training. It’s my largest project to date.'
draft: true
order: 5
---

This is a draft. **Confirm the NDA allows each detail below, especially the interaction example.** No screenshots or
footage are cleared yet.

## What it is

A virtual simulator for fire departments. Crews recreate specific calls they have run and walk through the scenario
together, cooperatively, in VR. The simulator provides the equipment and environment, and the department runs
the scenarios.

## My role

I’m the sole developer. I built the code, the functionality, the multiplayer synchronization and the performance
work, with an outside artist providing the 3D models.

## The hard part: interactions that behave like the real thing

The most difficult problem was making complex hands-on interactions work in VR and stay in sync between users. For
example, picking up a syringe, attaching a needle, attaching a vial, and having the syringe know which medication is
inside it.

In the first version, the standard VR interaction toolkits did not work with multiplayer, so I programmed every
interaction from scratch. Today those toolkits and the networking frameworks work well together, so the current
version builds on the toolkits, with modifications, and adds networking on top. The key rule is that anything shared
between users has to be network-aware.

## Why it matters for your project

Building a networked, scenario-driven simulator end to end is the same skill set needed for business training and
simulation work: interaction design, multiplayer, and performance on headsets. See
[Interactive & VR Training](/services/interactive-vr) for what I can build for you.
