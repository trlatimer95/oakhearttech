---
title: 'A VR training simulator for fire departments'
client: 'Confidential client'
service: 'Interactive & VR Training'
origin: 'contract'
seoTitle: 'Multiplayer VR Training Simulator'
seoDescription: 'A multiplayer VR simulator that lets fire departments train together on real calls, even when crews are in different places.'
summary: 'A VR simulator that lets fire departments train together on real calls, even when crews are in different places. I''m the sole developer.'
problem: 'Emergency medical skills are hard to practice realistically, and crews want to rehearse the calls they actually run, together, without everyone having to be in the same room.'
fix: 'I designed and built the simulator in Unity and C#, with networked multiplayer on Photon Fusion and an outside artist for the 3D models. I own the code, the multiplayer sync, the interactions and the performance.'
result: 'In development for several years and planned for fire department training. It''s my largest project to date.'
draft: false
order: 6
---

## What it is

A virtual simulator for fire departments. Crews recreate specific calls they've run and walk through the scenario
together, cooperatively, in VR, even when they're in different places. The simulator provides the equipment and
environment, and each department runs its own scenarios.

## My role

I'm the sole developer. I built the code, the functionality, the multiplayer synchronization and the performance work,
with an outside artist providing the 3D models.

## The hard part: interactions that behave like the real thing

The most difficult problem was making complex, multi-part hands-on interactions work in VR and stay in sync between
users, so everyone in the scene sees the same thing at the same time.

In the first version, the standard VR interaction toolkits didn't work with multiplayer, so I programmed every
interaction from scratch. Today those toolkits and the networking frameworks work well together, so the current
version builds on the toolkits, with modifications, and adds networking on top. The key rule is that anything shared
between users has to be network-aware.

## Why it matters for your project

Building a networked, scenario-driven simulator end to end is the same skill set needed for business training and
simulation work: interaction design, multiplayer, and performance on headsets. See
[Interactive & VR Training](/services/interactive-vr/) for what I can build for you.
