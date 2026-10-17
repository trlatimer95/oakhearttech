// Service copy follows the brief. Prices are placeholders until the owner decides them.
export interface Service {
  slug: string;
  title: string;
  icon: 'clipboard' | 'plug' | 'code' | 'lifebuoy' | 'headset' | 'gauge' | 'users';
  badge?: string;
  summary: string;
  price: string;
  priceNote: string;
  metaDescription: string;
  heroTitle: string;
  heroLead: string;
  signsTitle: string;
  signs: string[];
  includesTitle: string;
  includes: string[];
  processTitle: string;
  process: { title: string; text: string }[];
  stance?: string;
  faqs: { q: string; a: string }[];
}

const TAX = 'Prices exclude applicable Washington sales tax.';

export const services: Service[] = [
  {
    slug: 'workflow-checkup',
    title: 'Workflow Checkup',
    icon: 'clipboard',
    badge: 'Start here',
    summary: 'A working session and a written plan: the 3–5 fixes worth making first, with cost and time saved for each.',
    price: '$395',
    priceNote: `Fixed price, credited toward any project that follows. ${TAX}`,
    metaDescription:
      'A fixed-price Workflow Checkup for small businesses: a working session and a written plan of the 3–5 fixes worth making first.',
    heroTitle: 'Find out what’s actually slowing you down.',
    heroLead:
      'You know something is inefficient. You just don’t know what to fix first. The Workflow Checkup gives you a short, written, prioritized plan, so you can decide with real numbers in front of you.',
    signsTitle: 'Is this you?',
    signs: [
      'You know work takes longer than it should, but not where the time goes.',
      'You pay for software you barely use, or use three tools where one would do.',
      'Every fix you have heard about sounds expensive and vague.',
      'You want a plan you can hand to anyone, not a pitch for a big project.',
    ],
    includesTitle: 'What you get',
    includes: [
      'A 60–90 minute working session, remote, or in person near Spokane',
      'A walk through how work actually moves through your business, from lead to paid invoice',
      'A written report with 3–5 prioritized fixes',
      'For each fix: an estimated cost and the time it should save',
      'The checkup fee credited toward any follow-on project with me',
      'Scope: one workflow and up to about five tools or systems. A review across a whole company is quoted separately.',
    ],
    processTitle: 'How it works',
    process: [
      { title: 'Book', text: 'Pick a time for a free 30-minute call, or book the checkup directly.' },
      { title: 'Intake', text: 'A short form about your tools and what’s slowing you down.' },
      { title: 'Session', text: 'We walk through your workflow together. You show me; I ask questions.' },
      { title: 'Report', text: 'You get the written plan within 3 business days of the session.' },
    ],
    faqs: [
      {
        q: 'What if the answer is that you don’t need me?',
        a: 'Then I’ll say so. Sometimes the best fix is a setting in software you already own, and the report will tell you that.',
      },
      {
        q: 'Do I have to hire you afterward?',
        a: 'No. The report is yours. You can use it with me, with another developer, or on your own.',
      },
      {
        q: 'What do I need to prepare?',
        a: 'Nothing beyond the intake form. It helps to have a few examples handy, like a recent quote, invoice or schedule.',
      },
    ],
  },
  {
    slug: 'ai-implementation',
    title: 'Practical AI Implementation',
    icon: 'users',
    summary: 'Find where AI actually helps your business, set it up properly, and know where it doesn’t belong.',
    price: 'AI checkup $495',
    priceNote: `The checkup is a fixed $495, credited toward setup. Setup is quoted after, as a fixed price or at $125 an hour. ${TAX}`,
    metaDescription:
      'Practical AI implementation for small and mid-size businesses: find where AI saves real time, set up the workflows with guardrails, and know when not to use it.',
    heroTitle: 'Use AI where it helps. Know where it does not.',
    heroLead:
      'Most businesses are being told they need AI and have no one honest to ask. I show where it saves real time in your business, set it up with the right guardrails, and tell you where to leave it alone.',
    signsTitle: 'Sound familiar?',
    signs: [
      'You paste numbers or lists into AI to add them up or look things up, and have to double-check the answer.',
      'You use AI every day but retype the same prompts, and the good ones live in one person’s head.',
      'You use it a lot and can’t say what it actually saves.',
      'You’re not sure where AI would help your business, or how to start.',
      'Employees are already using it, and nobody has set any rules.',
      'You want the time savings without the risk of mistakes or leaked information.',
    ],
    includesTitle: 'What you get',
    includes: [
      'A review of how work actually flows through your business',
      'A written plan: 3–5 places AI helps and 2–3 places it should not be used',
      'An honest range of time saved for each, based on your own tasks',
      'Clear rules for what information should never go into AI tools',
      'For each task, the right tool: where AI helps, a saved and tested workflow with a checklist for checking its work; where it doesn’t, a small script or form',
      'A simple script or form in place of AI for exact jobs such as totals, lookups and reformatting, so the answer is the same every time, with no drift and no AI cost',
      'A before-and-after check on time spent, so you can see what it really saves',
      'Templates and a one-page usage guide, written for your business',
      'A hand-off walkthrough so your team knows how to use it and check its work',
    ],
    processTitle: 'How it works',
    process: [
      { title: 'Listen', text: 'A free call to understand your business and what you want from AI.' },
      { title: 'Review', text: 'The AI checkup: how your work flows and where AI fits, in writing.' },
      { title: 'Set up', text: 'Build the workflows you choose, with templates and guardrails.' },
      { title: 'Hand off', text: 'A walkthrough for your team and support as you put it to use.' },
    ],
    stance: 'AI is a tool that makes mistakes. I set it up so its work gets checked, and I’ll tell you where it doesn’t belong.',
    faqs: [
      {
        q: 'How is this different from automation?',
        a: 'Many people use AI to speed up a task but are really just swapping the manual work for pasting and prompting. This service starts from how you use AI today and decides what to keep, what to replace with a script, and what to leave alone. Automation starts from a manual process and connects your tools so data moves on its own. They sometimes overlap, but I scope them differently.',
      },
      {
        q: 'Why not just use AI for everything?',
        a: 'AI is good at language and judgment, but it can drift on exact work like adding up invoices or looking up a price. For jobs like that, I build a small script or form that gives the same answer every time, runs instantly, and costs nothing per use.',
      },
      {
        q: 'Do you recommend a particular AI tool?',
        a: 'I recommend what fits your work and budget, which is sometimes a tool you already pay for. Tools change quickly, so I build the checks and habits around the work, not around one product.',
      },
      {
        q: 'Is it safe to put our business information into AI tools?',
        a: 'Not all of it. A big part of the setup is defining what should never be pasted in, and which settings and plans protect your data. I’m not a lawyer, so for legal or regulatory questions I’ll tell you when to ask one.',
      },
      {
        q: 'How much will we save?',
        a: 'It depends on the work, so I give honest ranges from your own tasks, not promises. In my own business, AI-assisted quoting cut quoting hours by roughly 30–40%, and I verify everything it produces.',
      },
      {
        q: 'Will AI replace my staff?',
        a: 'That isn’t the goal and not what I recommend. The aim is to remove busywork so people can spend time on the work that needs them.',
      },
      {
        q: 'Can you work with my whole team?',
        a: 'Yes. Every setup includes a hand-off walkthrough, and I can run a longer team session on request, in person around Spokane or remotely.',
      },
    ],
  },
  {
    slug: 'automation-integrations',
    title: 'Automation & Integrations',
    icon: 'plug',
    summary: 'Find the manual process behind the busywork, then connect the tools so the data moves on its own.',
    price: 'Quoted after the checkup',
    priceNote: `Projects are quoted as a fixed price after a Workflow Checkup, based on what’s needed. Most start around $1,500. ${TAX}`,
    metaDescription:
      'Workflow automation and software integrations for small businesses: connect your existing tools and cut double data entry.',
    heroTitle: 'Make your tools talk to each other.',
    heroLead:
      'Most small businesses don’t need new software. They need the software they have to stop making people re-type things. I look at a manual process from start to finish, then connect your tools so the data moves on its own.',
    signsTitle: 'Signs you need this',
    signs: [
      'A lead starts in a spreadsheet, its status is tracked there, then the quote and invoice are rebuilt by hand in your accounting software.',
      'The same customer or job details get typed into more than one system.',
      'Someone exports a spreadsheet every week just to move data somewhere else.',
      'Follow-ups and reminders depend on someone remembering.',
    ],
    includesTitle: 'What’s included',
    includes: [
      'A map of the process from first contact to paid invoice, and every step that’s done by hand',
      'A simpler setup, often using tools you already pay for, such as leads and documentation in one place that syncs to your accounting software when something is created',
      'Integrations between your tools, built and tested',
      'Automation of the repetitive steps, with a manual fallback',
      'Plain-language documentation of what runs and why',
      'A hand-off session so your team knows how it works',
    ],
    processTitle: 'How a project runs',
    process: [
      { title: 'Listen', text: 'A free call to understand the business and the problem.' },
      { title: 'Diagnose', text: 'Agree on scope and price in writing, usually after a Workflow Checkup.' },
      { title: 'Fix', text: 'Fixed-scope work with regular check-ins, so you see progress.' },
      { title: 'Hand off', text: 'Documentation, training, and the accounts are yours.' },
    ],
    faqs: [
      {
        q: 'Can you work with the software I already pay for?',
        a: 'Usually, yes. Making what you have work better is often cheaper than replacing it.',
      },
      {
        q: 'How is this different from your AI service?',
        a: 'Automation starts with a manual process and connects your tools so the data moves without anyone retyping it. The AI service starts with how you’re using AI today, often a manual task with a prompt bolted on, and decides what to keep, what to replace with a script, and what to leave alone. They overlap sometimes, since fixing AI use can mean building an automation, but they start from different places.',
      },
      {
        q: 'What happens if a connected tool changes?',
        a: 'Integrations can break when a vendor changes something. I document how each one works, so you or another developer can fix it, and I can quote ongoing support if you want it.',
      },
    ],
  },
  {
    slug: 'custom-software',
    title: 'Custom Software & Websites',
    icon: 'code',
    summary: 'When off-the-shelf doesn’t fit: purpose-built tools and websites that do their job and are yours to keep.',
    price: 'Quoted after discovery',
    priceNote: `Quoted as a fixed price once the scope is clear, usually after a Workflow Checkup. Most projects start around $5,000. ${TAX}`,
    metaDescription:
      'Custom software and websites for small businesses, built to fit how you work, with code and accounts handed over to you.',
    heroTitle: 'Software built to fit, not squeezed to fit.',
    heroLead:
      'Sometimes nothing off the shelf matches how your business works. I design and build the tool, or the website, that does, and I hand over everything when it’s done.',
    signsTitle: 'A good fit if',
    signs: [
      'You have been bending your process around software that doesn’t quite fit.',
      'Your website doesn’t bring in work, or is hard for you to update.',
      'You have a spreadsheet that has quietly become critical to the business.',
      'You need an internal tool, a customer portal, or a simple booking or quoting flow.',
    ],
    includesTitle: 'What’s included',
    includes: [
      'A written scope with a fixed price wherever possible',
      'Design, build and testing in short stages you can review',
      'Code, accounts and documentation handed over to you',
      'No lock-in: another developer can pick it up',
    ],
    processTitle: 'How a project runs',
    process: [
      { title: 'Listen', text: 'A free call to understand the business and the goal.' },
      { title: 'Map', text: 'A written plan, scope and price before any build begins.' },
      { title: 'Build', text: 'Regular check-ins. Changes to scope are agreed in writing first.' },
      { title: 'Hand off', text: 'Documentation, training, and you own what you paid for.' },
    ],
    faqs: [
      {
        q: 'Who owns the software you build?',
        a: 'You do, once paid. I keep my own reusable tools and license them to you for use in your project.',
      },
      {
        q: 'Do you build websites too?',
        a: 'Yes. Small-business sites that load fast, are easy to find and are easy for you to update.',
      },
    ],
  },
  {
    slug: 'software-rescue',
    title: 'Software Rescue',
    icon: 'lifebuoy',
    summary: 'A stalled, abandoned or broken software project or website, assessed honestly and either fixed or replaced.',
    price: 'Assessment from $595',
    priceNote: `The assessment is a fixed-price first step: $595 for a small to medium codebase, larger ones quoted, and credited toward the fix. Fixes are quoted after, as a fixed price or at $125 an hour. ${TAX}`,
    metaDescription:
      'Software rescue: an honest assessment of stalled, abandoned or AI-generated code, then a plan to finish it or replace it.',
    heroTitle: 'Your software project stalled. Let’s find out why.',
    heroLead:
      'No blame, no sales pitch. I review what exists, tell you plainly what’s salvageable, and give you options with real costs. That includes websites that are slow, down or falling apart.',
    signsTitle: 'Recognize any of these?',
    signs: [
      'Deadlines keep slipping, and nobody can say when it will be done.',
      'The developer disappeared, or stopped answering.',
      'Nobody on your side understands the code.',
      'Someone used AI to generate the code, and it breaks whenever you change anything.',
      'You have paid a lot and have little that works.',
      'Your website is slow, down, or full of broken links, or its contact form doesn’t deliver.',
    ],
    includesTitle: 'What an assessment covers',
    includes: [
      'Review of the code, hosting, accounts and documentation',
      'A plain-language report on what works, what doesn’t, and what’s risky',
      'Options with estimated costs: finish it, fix parts, or rebuild',
      'A recommendation, including when rebuilding is cheaper',
      'For websites: slow pages, errors, broken links, forms that don’t deliver, expired certificates, basic search fixes such as missing titles and descriptions, and who controls the domain and hosting',
    ],
    processTitle: 'The rescue process',
    process: [
      { title: 'Assess', text: 'I review what exists and talk to you about what it was supposed to do.' },
      { title: 'Diagnose', text: 'What works, what’s broken, and what’s risky.' },
      { title: 'Options', text: 'Two or three paths with honest cost and time estimates.' },
      { title: 'Stabilize', text: 'Secure accounts, fix critical issues, stop the bleeding.' },
      { title: 'Continue', text: 'Finish the work, or hand a clean plan to whoever should.' },
    ],
    stance: 'Honesty over optimism: if it’s cheaper to rebuild, I’ll tell you.',
    faqs: [
      {
        q: 'What if my last developer disappeared?',
        a: 'The first step is making sure you have access to your code, hosting and accounts. Then we look at what’s there.',
      },
      {
        q: 'Can you work with AI-generated code?',
        a: 'Yes. I’ll tell you honestly whether it’s worth keeping or whether starting clean is the better investment.',
      },
      {
        q: 'Do you do SEO or marketing for websites?',
        a: 'I fix the basics that hold a site back: speed, mobile layout, broken links, missing titles and descriptions, and forms that don’t deliver. Often a few simple fixes make a real difference. I don’t do ongoing marketing, content or ad campaigns, and for that I’ll point you to someone who specializes in it.',
      },
    ],
  },
  {
    slug: 'software-cost-review',
    title: 'Software & Subscription Cost Review',
    icon: 'gauge',
    summary: 'Find the overlapping tools, unused seats and over-tiered plans you’re paying for, then have me set up what I recommend.',
    price: 'Assessment from $395',
    priceNote: `The assessment is a fixed-price first step from $395, set so it pays for itself quickly, and credited toward the implementation. Setting up what I recommend is quoted after, as a fixed price or at $125 an hour. ${TAX}`,
    metaDescription:
      'A fixed-price assessment of your software subscriptions (CRMs, project tools, Microsoft 365 and more): find overlapping tools, unused seats and over-tiered plans, with a written list of what to consolidate, and help setting it up.',
    heroTitle: 'Stop paying for software you don’t use, or use twice.',
    heroLead:
      'Subscriptions pile up, and tools quietly overlap. I go through what you pay for, find the overlap and waste, and give you a written list of what to consolidate, drop or downgrade, with the monthly saving for each.',
    signsTitle: 'Signs you need this',
    signs: [
      'You pay for two or three tools that do much the same job.',
      'You’re paying for seats for people who left, or tools only one person uses.',
      'Nobody can say what each subscription is for, or when it renews.',
      'You pay for the higher tier of something without being sure you need it.',
      'Your software bill has grown and nobody can explain why.',
    ],
    includesTitle: 'What’s included',
    includes: [
      'An inventory of every subscription: what it costs, who uses it and when it renews',
      'Which tools overlap, and what could be consolidated into fewer',
      'Unused seats and plans that are bigger than you need',
      'A written list of recommended changes, with the monthly saving for each',
      'Risks flagged, such as data migration, so nothing you rely on breaks',
      'A renewal calendar, so changes happen at the right time',
      'Then, if you want it: I set up what I recommend, such as QuickBooks integrations, Asana projects and automations, and moving your data over',
      'Optional add-on: a review of cloud resources, such as Azure, if you have them',
    ],
    processTitle: 'How it works',
    process: [
      { title: 'Scope', text: 'A free call to see what you use and where the bills come from.' },
      { title: 'Inventory', text: 'Bank or card statements, invoices and admin exports. Read-only access at most.' },
      { title: 'Analyze', text: 'Go through every line: used, unused, overlapping or too big.' },
      { title: 'Report', text: 'A written list within 5 business days, ranked by savings.' },
      { title: 'Implement', text: 'Optional: I set up the changes, quoted after the report and credited with your assessment fee.' },
    ],
    stance: 'If there are no meaningful savings to find, I’ll tell you. Sometimes the answer is to keep what you have.',
    faqs: [
      {
        q: 'What do you need from me?',
        a: 'A list of what you pay for, usually from card or bank statements and invoices, plus admin exports from tools like Microsoft 365. Read-only access at most. You stay in control of every change.',
      },
      {
        q: 'Can you set up what you recommend?',
        a: 'Yes. Many clients ask me to. That can mean setting up QuickBooks integrations, building out Asana projects and automations, or moving your data between tools. It’s quoted after the report, and your assessment fee is credited toward it.',
      },
      {
        q: 'Will you make me switch tools?',
        a: 'Only when switching is clearly cheaper than staying, counting migration time and risk. Often the right answer is to drop the weakest tool and keep the rest.',
      },
      {
        q: 'How much could I save?',
        a: 'It depends on what you have, so I give an honest estimate line by line, not a promise. In my own business, after comparing about five tools built for contractors, I cut software costs from $700+ a month to about $250.',
      },
      {
        q: 'Is this a security audit?',
        a: 'No. I look at cost, overlap and obvious waste. If you need a formal security assessment, I’ll say so and point you to someone who does that work.',
      },
      {
        q: 'What tools do you cover?',
        a: 'Any subscription: CRMs, project and documentation tools, Microsoft 365, accounting and the like. For companies on Azure, I can also review cloud resources.',
      },
    ],
  },
  {
    slug: 'interactive-vr',
    title: 'Interactive & VR Training',
    icon: 'headset',
    summary: 'Interactive training and simulation, including VR, for teams that need people to practice before it counts.',
    price: 'Project-based',
    priceNote: `Scoped per project. ${TAX}`,
    metaDescription:
      'Interactive and VR training and simulation software built in Unity, from a studio with hands-on experience building VR EMS training.',
    heroTitle: 'Training people can practice, not just read.',
    heroLead:
      'Some skills are best learned by doing, in a safe place to get it wrong. I build interactive training and simulations, including VR, for businesses and organizations.',
    signsTitle: 'A good fit if',
    signs: [
      'The skill is hands-on, high-stakes or expensive to practice for real.',
      'Slide decks and videos aren’t changing what people do on the job.',
      'You want repeatable scenarios and a way to see how people performed.',
    ],
    includesTitle: 'What’s included',
    includes: [
      'Scenario design with your subject-matter experts',
      'Interactive or VR build, tested with real users',
      'Deployment support and documentation',
      'Optional updates as procedures change',
    ],
    processTitle: 'How a project runs',
    process: [
      { title: 'Listen', text: 'What people need to be able to do, and what goes wrong today.' },
      { title: 'Map', text: 'Scenarios, scope and a prototype plan.' },
      { title: 'Build', text: 'Iterative builds you can try early.' },
      { title: 'Hand off', text: 'Deployment, documentation and training for your team.' },
    ],
    faqs: [
      {
        q: 'Does it need VR headsets?',
        a: 'Not always. Some training works well on a regular computer or tablet. We pick the format that suits the skill and the budget.',
      },
    ],
  },
];

// Display order everywhere (home cards, footer, services page): fix-first, build last.
const displayOrder = [
  'workflow-checkup',
  'software-rescue',
  'automation-integrations',
  'software-cost-review',
  'ai-implementation',
  'custom-software',
  'interactive-vr',
];
services.sort((a, b) => displayOrder.indexOf(a.slug) - displayOrder.indexOf(b.slug));

export const getService = (slug: string) => services.find((s) => s.slug === slug)!;
