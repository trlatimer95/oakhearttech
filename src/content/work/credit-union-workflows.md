---
title: 'From 10-step spreadsheet routines to a one-page form'
client: 'Regional credit union (anonymized)'
service: 'Automation & Integrations'
summary: 'During a core-platform migration, I worked with each department, found where manual spreadsheets and re-keying lived, and replaced them with simple forms and automation. Many 8-step processes became a single submission.'
problem: 'Departments ran on spreadsheets and manual data entry, many stored on individual employees’ computers, holding large amounts of data. The same numbers were typed into a spreadsheet and then again into the system.'
fix: 'I spent time with each business unit, mapped how they really worked, and built single-page forms that calculate and write straight to the database. I also built scripts to bulk-load very large data files and integrated separate systems with the core platform.'
result: 'One department went from a 10+ step weekly process to a one-screen entry with a handful of clicks. Many other processes went from about 8 steps to one form submission, and key data moved out of personal spreadsheets into the core platform.'
draft: true
order: 4
---

This is a draft. Keep the employer anonymized, and keep details general enough that no one could be identified.

## The approach

Listen first. Each business unit got focused time with the people doing the work before any code was written. Looking
for places where the same information was entered twice was usually enough to find the biggest improvements.

## One example

A department collected amounts due every week. They typed the amounts into a spreadsheet to get a total, then went
into the system and entered the same values again.

I built a single page, reachable from a menu item in the core platform, where they enter the numbers once. It performs
the calculation and writes the result to the database. A process of 10+ steps became a one- or two-value form and
three or four clicks.

## What else I built

- **Single-form submissions** to replace multi-step processes. Many went from about 8 steps to one form with a few
  selections.
- **Bulk-loading scripts in C#** that take files with 10,000+ lines of data and insert them into the database reliably.
- **System-to-system integrations** using SOAP requests, including a web form for one team and the requests that send
  its data to the core platform, since the two systems were separate.

I worked mostly on my own and worked closely with the data analysis team to find areas to improve.

## What changed

- Manual spreadsheet entry was eliminated wherever the core platform could take over.
- Data that lived on individual employees’ computers moved into one system of record.
- People spent their time on work, not re-typing.

This is the same process I use today in the Workflow Checkup.
