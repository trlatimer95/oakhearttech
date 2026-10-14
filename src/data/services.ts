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
    price: 'From $[X]',
    priceNote: `Fixed price, credited toward a follow-on project. ${TAX}`,
    metaDescription:
      'A fixed-price Workflow Checkup for small businesses: a working session and a written plan of the 3–5 fixes worth making first.',
    heroTitle: 'Find out what is actually slowing you down.',
    heroLead:
      'You know something is inefficient. You just do not know what to fix first. The Workflow Checkup gives you a short, written, prioritized plan, so you can decide with real numbers in front of you.',
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
    ],
    processTitle: 'How it works',
    process: [
      { title: 'Book', text: 'Pick a time for a free 30-minute call, or book the checkup directly.' },
      { title: 'Intake', text: 'A short form about your tools and what is slowing you down.' },
      { title: 'Session', text: 'We walk through your workflow together. You show me; I ask questions.' },
      { title: 'Report', text: 'You get the written plan within [X] business days.' },
    ],
    faqs: [
      {
        q: 'What if the answer is that you do not need me?',
        a: 'Then I will say so. Sometimes the best fix is a setting in software you already own, and the report will tell you that.',
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
    summary: 'Find where AI actually helps your business, set it up properly, and know where it does not belong.',
    price: 'From $[X]',
    priceNote: `The checkup is a fixed price; setup is scoped per project. ${TAX}`,
    metaDescription:
      'Practical AI implementation for small and mid-size businesses: find where AI saves real time, set up the workflows with guardrails, and know when not to use it.',
    heroTitle: 'Use AI where it helps. Know where it does not.',
    heroLead:
      'Most businesses are being told they need AI and have no one honest to ask. I show where it saves real time in your business, set it up with the right guardrails, and tell you where to leave it alone.',
    signsTitle: 'Sound familiar?',
    signs: [
      'You hear about AI constantly and cannot tell where it applies to your business.',
      'Employees are already using it, and nobody has set any rules.',
      'You tried a tool, got mixed results, and are not sure why.',
      'You want the time savings without the risk of mistakes or leaked information.',
    ],
    includesTitle: 'What you get',
    includes: [
      'A review of how work actually flows through your business',
      'A written plan: 3–5 places AI helps and 2–3 places it should not be used',
      'An honest range of time saved for each, based on your own tasks',
      'Clear rules for what information should never go into AI tools',
      'Setup of the specific workflows you choose, such as drafting, summarizing, estimating or scheduling',
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
    stance: 'AI is a tool that makes mistakes. I set it up so its work gets checked, and I will tell you where it does not belong.',
    faqs: [
      {
        q: 'Do you recommend a particular AI tool?',
        a: 'I recommend what fits your work and budget, which is sometimes a tool you already pay for. Tools change quickly, so I build the checks and habits around the work, not around one product.',
      },
      {
        q: 'Is it safe to put our business information into AI tools?',
        a: 'Not all of it. A big part of the setup is defining what should never be pasted in, and which settings and plans protect your data. I am not a lawyer, so for legal or regulatory questions I will tell you when to ask one.',
      },
      {
        q: 'How much will we save?',
        a: 'It depends on the work, so I give honest ranges from your own tasks, not promises. In my own business, AI-assisted quoting cut quoting hours by roughly 30–40%, and I verify everything it produces.',
      },
      {
        q: 'Will AI replace my staff?',
        a: 'That is not the goal and not what I recommend. The aim is to remove busywork so people can spend time on the work that needs them.',
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
    summary: 'Stop typing the same data into three systems. Connect the tools you already pay for.',
    price: 'From $[X]',
    priceNote: `Typical projects range from $[X]–$[Y]. ${TAX}`,
    metaDescription:
      'Workflow automation and software integrations for small businesses: connect your existing tools and cut double data entry.',
    heroTitle: 'Make your tools talk to each other.',
    heroLead:
      'Most small businesses do not need new software. They need the software they have to stop making people re-type things. I connect your tools and automate the repetitive steps.',
    signsTitle: 'Signs you need this',
    signs: [
      'The same customer or job details get typed into more than one system.',
      'Quotes and invoices are built by hand from a template.',
      'Someone exports a spreadsheet every week just to move data somewhere else.',
      'Follow-ups and reminders depend on someone remembering.',
    ],
    includesTitle: 'What is included',
    includes: [
      'A map of the steps being repeated by hand',
      'Integrations between the tools you already use, built and tested',
      'Automation of the repetitive steps, with a manual fallback',
      'Plain-language documentation of what runs and why',
      'A hand-off session so your team knows how it works',
    ],
    processTitle: 'How a project runs',
    process: [
      { title: 'Listen', text: 'A free call to understand the business and the problem.' },
      { title: 'Map', text: 'Agree on scope and price in writing, usually after a Workflow Checkup.' },
      { title: 'Build', text: 'Fixed-scope work with regular check-ins, so you see progress.' },
      { title: 'Hand off', text: 'Documentation, training, and the accounts are yours.' },
    ],
    faqs: [
      {
        q: 'Can you work with the software I already pay for?',
        a: 'Usually, yes. Making what you have work better is often cheaper than replacing it.',
      },
      {
        q: 'Can you help us use AI in our business?',
        a: 'Yes, where it makes sense. I will show you where it saves time, what it should never be left to do alone, and what information should never go into it. Sometimes the honest answer is that you do not need it yet.',
      },
      {
        q: 'What happens if a connected tool changes?',
        a: 'Integrations can break when a vendor changes something. I document how each one works and can offer an optional care plan.',
      },
    ],
  },
  {
    slug: 'custom-software',
    title: 'Custom Software & Websites',
    icon: 'code',
    summary: 'When off-the-shelf does not fit: purpose-built tools and websites that do their job and are yours to keep.',
    price: 'From $[X]',
    priceNote: `Typical projects range from $[X]–$[Y]. ${TAX}`,
    metaDescription:
      'Custom software and websites for small businesses, built to fit how you work, with code and accounts handed over to you.',
    heroTitle: 'Software built to fit, not squeezed to fit.',
    heroLead:
      'Sometimes nothing off the shelf matches how your business works. I design and build the tool, or the website, that does, and I hand over everything when it is done.',
    signsTitle: 'A good fit if',
    signs: [
      'You have been bending your process around software that does not quite fit.',
      'Your website does not bring in work, or is hard for you to update.',
      'You have a spreadsheet that has quietly become critical to the business.',
      'You need an internal tool, a customer portal, or a simple booking or quoting flow.',
    ],
    includesTitle: 'What is included',
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
    slug: 'project-rescue',
    title: 'Project Rescue',
    icon: 'lifebuoy',
    summary: 'A stalled, abandoned or broken software project, assessed honestly and either fixed or replaced.',
    price: 'From $[X]',
    priceNote: `The assessment is a fixed-price first step. ${TAX}`,
    metaDescription:
      'Software project rescue: an honest assessment of stalled, abandoned or AI-generated code, then a plan to finish it or replace it.',
    heroTitle: 'Your software project stalled. Let us find out why.',
    heroLead:
      'No blame, no sales pitch. I review what exists, tell you plainly what is salvageable, and give you options with real costs.',
    signsTitle: 'Recognize any of these?',
    signs: [
      'Deadlines keep slipping, and nobody can say when it will be done.',
      'The developer disappeared, or stopped answering.',
      'Nobody on your side understands the code.',
      'Someone used AI to generate the code, and it breaks whenever you change anything.',
      'You have paid a lot and have little that works.',
    ],
    includesTitle: 'What an assessment covers',
    includes: [
      'Review of the code, hosting, accounts and documentation',
      'A plain-language report on what works, what does not, and what is risky',
      'Options with estimated costs: finish it, fix parts, or rebuild',
      'A recommendation, including when rebuilding is cheaper',
    ],
    processTitle: 'The rescue process',
    process: [
      { title: 'Assess', text: 'I review what exists and talk to you about what it was supposed to do.' },
      { title: 'Diagnose', text: 'What works, what is broken, and what is risky.' },
      { title: 'Options', text: 'Two or three paths with honest cost and time estimates.' },
      { title: 'Stabilize', text: 'Secure accounts, fix critical issues, stop the bleeding.' },
      { title: 'Continue', text: 'Finish the work, or hand a clean plan to whoever should.' },
    ],
    stance: 'Honesty over optimism: if it is cheaper to rebuild, I will tell you.',
    faqs: [
      {
        q: 'What if my last developer disappeared?',
        a: 'The first step is making sure you have access to your code, hosting and accounts. Then we look at what is there.',
      },
      {
        q: 'Can you work with AI-generated code?',
        a: 'Yes. I will tell you honestly whether it is worth keeping or whether starting clean is the better investment.',
      },
    ],
  },
  {
    slug: 'cloud-cost-review',
    title: 'Cloud & Software Cost Review',
    icon: 'gauge',
    summary: 'Find the subscriptions, licenses and cloud resources you are paying for and not using, and what to trim.',
    price: 'From $[X]',
    priceNote: `Fixed price. Can be combined with a Workflow Checkup. ${TAX}`,
    metaDescription:
      'A fixed-price review of your software subscriptions and cloud spend (Azure, AWS, Microsoft 365 and more), with a written list of what to cut and what it saves.',
    heroTitle: 'Stop paying for software and cloud services you do not use.',
    heroLead:
      'Subscriptions pile up. Cloud resources get started and forgotten. I go through what you are paying for, find the waste, and give you a written list of what to change and what it saves.',
    signsTitle: 'Signs you need this',
    signs: [
      'Your monthly software or cloud bill has grown and nobody can say why.',
      'You are paying for licenses for people who left, or for tools two people use.',
      'A previous developer set up cloud resources and nobody knows what is safe to turn off.',
      'You pay for the higher tier of something without being sure you need it.',
    ],
    includesTitle: 'What is included',
    includes: [
      'An inventory of your subscriptions, licenses and cloud resources, with what each costs',
      'What is unused, duplicated or over-provisioned',
      'A written list of recommended changes, with the monthly saving for each',
      'Risks flagged, so nothing you rely on gets switched off by mistake',
      'Optional: I make the changes with you',
    ],
    processTitle: 'How it works',
    process: [
      { title: 'Scope', text: 'A free call to see what you use and where the bills come from.' },
      { title: 'Inventory', text: 'Read-only access to billing and resource views, or exports you share.' },
      { title: 'Analyze', text: 'Go through every line: used, unused, duplicated or too big.' },
      { title: 'Report', text: 'A written list within [X] business days, ranked by savings.' },
    ],
    stance: 'If there are no meaningful savings to find, I will tell you.',
    faqs: [
      {
        q: 'Do you need access to our accounts?',
        a: 'Only read-only access to billing and resource views, or exports you share with me. You stay in control of any changes.',
      },
      {
        q: 'Is this a security audit?',
        a: 'No. I look at cost and obvious waste. If you need a formal security assessment, I will say so and point you to someone who does that work.',
      },
      {
        q: 'What platforms do you cover?',
        a: 'Microsoft Azure and Microsoft 365 are where I have the most experience, plus the usual SaaS subscriptions. Tell me what you use and I will say if it is a fit.',
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
      'Slide decks and videos are not changing what people do on the job.',
      'You want repeatable scenarios and a way to see how people performed.',
    ],
    includesTitle: 'What is included',
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

export const getService = (slug: string) => services.find((s) => s.slug === slug)!;
