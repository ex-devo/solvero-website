# Designing operations around AI: the organisational work behind productivity

By [Jateen Narsai](author-jateen-narsai.md)

Designing operations around AI means changing how work moves, who can make decisions and how systems support delivery. A useful AI operating model connects people, automation, information and controls around a business outcome. Introducing the technology is one part of that work; the organisation also needs time, ownership and investment to change its processes.

An AI tool might prepare a request in minutes. The customer can still wait days while someone checks it, finds an approver and copies the result into another system. The preparation step has improved, but the business has yet to deliver a faster service.

The opportunity is to redesign that complete journey. That requires looking beyond the task AI performs to the coordination, infrastructure and human judgement surrounding it.

![Two workflow rows show AI speeding preparation while review remains queued, followed by a redesigned process with validation, rule-based routing and confirmed completion.](/images/blog/ai-operating-model/ai-bottleneck.webp)

*Improving preparation alone can leave the next stage overloaded. Workflow redesign connects validation, routing and completion.*

## Faster output exposes the next constraint

In its October 2026 [account of redesigning source control](https://www.anthropic.com/engineering/redesigning-source-control), Anthropic reports that daily merged code changes increased from around 2,500 in May to more than 30,000 in September. Source control—the system coordinating changes to shared code—became a constraint.

Anthropic built Scion around largely online agents and automated jobs, shifting work to servers and retrieving files as needed. A seven-person team delivered it, related tools and the migration in five months. The company reports a 200-fold reduction in CPU and memory requirements compared with its previous Git-mirroring infrastructure.

The surrounding practices changed too: engineers reviewed the intent of changes, and concurrent merging depended on stronger testing after merge and before deployment. Anthropic explicitly describes an unusual workload and says Scion is unsuitable as a general replacement for Git.

For other businesses, the useful question is which assumptions become limiting as AI increases activity. More code changes are not, by themselves, a measure of business value. Equally, more proposals, processed documents or drafted responses only help when they lead to reliable completed outcomes.

## Question the process before accelerating it

The warning about “paving the cow paths” applies when a business automates the route work has historically followed without asking why that route exists.

An approval meeting might exist because information used to arrive in separate spreadsheets. A coordinator might retype details because two systems cannot share a record. A weekly batch might reflect the time it once took to assemble a report. Each arrangement deserves examination when those conditions change.

Start with the outcome and work backwards. Which information is needed? Which decision creates authority? Which steps protect customers or the business? Which handoffs exist simply to move information?

Some controls will remain necessary. Independent approval of a financial commitment serves a different purpose from manually forwarding its supporting documents. Redesign the information flow while preserving the required authority.

![A paved road follows a winding cow track between a barn and a field gate. Beside it, a redesigned route connects the same destination more directly while retaining a necessary checkpoint.](/images/blog/ai-operating-model/dont-pave-the-cow-paths.webp)

*Begin with the destination and the constraints that matter. Making an inherited route faster can preserve unnecessary detours.*

An organisation chart alone cannot describe the new arrangement. Add automated steps and agents to the process map, showing their inputs, permissions, dependencies and responsible human owners. One person may own an outcome supported by several automated activities; putting an agent in every existing job box can preserve unnecessary handoffs.

## Learn from factory electrification

The productivity paradox associated with economist Robert Solow captures a recurring problem: widespread technology adoption can coexist with disappointing measured productivity. Installing a capability and learning to organise work around it are different achievements.

Factory electrification offers a historical parallel. Individual electric drives allowed manufacturers to rethink machine placement and production flow beyond the constraints of shared mechanical power. The wider gains involved changes to the organisation of production. [Research on manufacturing electrification](https://www.nber.org/system/files/working_papers/w28076/revisions/w28076.rev0.pdf) discusses that relationship between technology and factory design.

![Two factory layouts use electric power. One retains a central shaft and belts with machines clustered around them; the other gives machines individual drives and arranges them in a clearer production sequence.](/images/blog/ai-operating-model/electricity-and-factory-redesign.webp)

*Individual electric drives created freedom to reorganise the factory floor. AI similarly creates reasons to question how work is arranged.*

## Fund the organisational work behind the technology

Erik Brynjolfsson, Daniel Rock and Chad Syverson's [productivity J-curve research](https://www.nber.org/papers/w25148) explains how technologies such as AI require complementary investments in processes, skills and organisational knowledge. Much of that investment is intangible and poorly reflected in conventional productivity measures, so measured gains can lag behind the work of adoption.

For a business planning an AI workflow, the practical implication is to budget for discovery, data preparation, integration, training, testing and operational support. Staff may temporarily run the existing process while helping design and evaluate its replacement. That creates real demands on their capacity.

Assign time for that work and agree checkpoints for continuing, changing or stopping the initiative. The J-curve offers an explanation for delayed measured gains; it does not guarantee an eventual return or justify an indefinitely unsuccessful project.

![Productivity J-curve showing a flat starting level, a dip during investment, redesign and learning, and a rise as organisational changes take hold.](/images/blog/ai-operating-model/productivity-j-curve.webp)

*Investment in skills, processes and systems can precede measurable productivity gains.*

## Make five operating decisions before scaling

An AI operating model becomes useful when it resolves decisions people otherwise have to improvise. The following five areas connect organisational intent to daily operation.

| Operating decision | What needs to be agreed | Evidence that makes it concrete |
|---|---|---|
| Outcome and ownership | The result being improved, its process owner and the sponsor who can resolve cross-team conflicts | A defined start and finish, baseline measures and named decision makers |
| Work and authority | What AI proposes or executes, what rules enforce and what people authorise | A process map with permitted actions, review conditions and escalation routes |
| Information and systems | Which records are authoritative, what access is permitted and how updates are confirmed | Agreed data definitions, interfaces, access limits and reconciliation arrangements |
| People and adoption | How roles, skills, workload and incentives change | Protected learning time, revised responsibilities and a way to report problems |
| Ongoing operation | Who monitors quality, supports failures, approves changes and funds continued use | Acceptance criteria, an operating owner, support arrangements and a release process |

Bring the people doing the work into these decisions alongside business, technology and relevant control specialists. A process owner needs enough authority to change the handoffs; an implementation team needs access to the people who understand exceptions.

For a smaller business, several responsibilities may sit with the same person. They still need to be explicit. A separate AI department is not a prerequisite for improving one workflow.

## Automate coordination while keeping accountability visible

Coordination is often hidden inside apparently productive work: finding the current document, asking who owns a request, chasing a missing attachment or holding a meeting to exchange status updates.

A shared case record can replace repeated status enquiries. Rules can route complete requests to the appropriate owner. AI can help interpret varied messages or assemble a review summary with links to the evidence. Notifications can explain what is missing and what action is needed.

Work that is genuinely independent may run in parallel. Work that depends on an earlier decision must retain that sequence. Parallel processing also needs controls for two activities trying to change the same record.

Give reviewers a defined decision and the information needed to make it. A requirement to “check everything” can create an unmanageable queue and unclear responsibility. Review should have a purpose, an owner and a practical workload.

Whether every case needs approval, selected cases need review or some actions can proceed automatically depends on the consequences and observed reliability. Reducing review requires evidence and an authorised policy decision. An AI-generated confidence score alone does not establish that an action is safe.

The [approval workflow guide](/blog/approval-workflow-automation/) covers authority and escalation in more detail. The [AI and rules-based automation guide](/blog/ai-vs-rules-based-automation/) helps decide which method fits each individual step.

![People pass information between disconnected work areas. In a redesigned workflow, validation and routing move routine information while people handle exceptions, decisions and relationships.](/images/blog/ai-operating-model/automate-the-coordination.webp)

*When the workflow carries information reliably, people can give more attention to the decisions and relationships that need them.*

## Design the systems for the volume you intend to create

An AI-assisted intake process can produce work faster than a receiving application or team can handle it. Test the full route into delivery, including system limits, processing capacity and the demand on exception reviewers.

Establish a shared case reference and agreed data ownership. Decide how the workflow handles repeated events, conflicting updates, unavailable services and uncertainty about whether an action succeeded. A timeout after an account update needs reconciliation before another write is attempted.

Limit an agent's access to the information and actions its task requires. Treat instructions found inside emails or documents as untrusted content. Define how sensitive information is handled, which providers may process it and how long records are retained. Requirements will depend on the business, its contracts and the jurisdictions involved.

Monitoring should show which cases are progressing, blocked or unresolved, alongside service health, errors and operating cost. Automated monitoring can help identify unusual patterns; give someone responsibility and authority to investigate and respond.

Build evaluations around representative ordinary cases and known failures. Retest material changes to models, instructions, rules or connected systems. Keep a controlled way to pause automated actions and reconcile unfinished cases. [NIST's voluntary AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) provides a broader reference for incorporating trustworthiness into design, use and evaluation.

The appropriate response to a constraint may be a clearer form, an existing connector or a changed approval policy. Bespoke infrastructure needs a demonstrated requirement and a business case covering its future support.

## An illustrative example: redesigning service-change requests

**The following example is fictional. It describes a possible design, not a Solvero client implementation or a measured result.**

A service business receives customer change requests by email. A coordinator reads each message, checks the agreement, asks delivery for an estimate, finds an approver and updates the job record.

Adding AI to summarise the email helps with reading. The wider redesign addresses how a request becomes an authorised, deliverable change.

| Part of the journey | Proposed operating design |
|---|---|
| Receive and identify | Create one case reference and preserve the original request. AI suggests structured details with supporting source text. |
| Establish readiness | Rules check required fields and the agreement reference. Missing or contradictory information goes to an owner for resolution. |
| Assess feasibility | Delivery receives a complete request and records its estimate. Independent checks run together where appropriate. |
| Authorise the change | A designated person approves scope, price or commitments under the agreed policy, against the current request revision. |
| Complete the handoff | The workflow updates the job system once, confirms the result and routes unresolved cases to a named owner. |

The coordinator's knowledge helps define what a complete request looks like and which exceptions need attention. Their role may shift towards resolving unusual cases, maintaining process quality and supporting customers.

Evaluate the design from receipt to confirmed handoff. Include incorrect extraction, review time, incomplete requests, failed updates and the workload arriving in delivery. A faster first stage is useful only if the complete service improves.

## Plan how people's work will change

Removing coordination effort can allow a team to handle more completed work with similar staffing. That is a possibility to test. It does not establish a universal productivity multiplier or determine what should happen to headcount.

The “post-labour” argument in discussions of AI imagines human effort becoming less of a constraint on output. That remains a broader economic proposition. Individual firms still face limits in demand, capital, infrastructure, judgement and responsibility.

Before reducing coordination roles, understand the work those people actually do. Following up a request may include interpreting an unwritten policy, protecting a customer relationship or spotting an error that no formal check captures. Removing the role before redesigning those functions can leave the process without its essential support.

Four human contributions need deliberate provision:

- **Accountability:** someone owns the outcome and can intervene when the system acts incorrectly.
- **Long-term direction:** leaders choose priorities, acceptable trade-offs and what the business should achieve.
- **Relationships and trust:** people handle negotiation, sensitive conversations and commitments to customers and colleagues.
- **Context and tacit knowledge:** experienced staff explain exceptions and judgement that procedures have yet to capture.

![Four human contributions: accountability to own the outcome, long-term direction to choose priorities, relationships and trust to handle sensitive conversations, and tacit knowledge to understand exceptions.](/images/blog/ai-operating-model/human-contributions.webp)

*An AI operating model needs to make room for accountability, direction, relationships and tacit knowledge.*

Use real cases to document that knowledge, test the resulting rules and keep disputed interpretations visible. Documentation helps AI and people work more consistently; it does not make every judgement reducible to a rule.

Give staff training in evaluating outputs, recognising failures and escalating concerns. Adjust performance measures so people are rewarded for reliable completion and useful problem reporting. If the incentive is simply to generate more items, quality and downstream workload can suffer.

Leaders should explain the intended use of released capacity—such as improving service, absorbing growth or changing responsibilities—and be candid about workforce decisions. Participation is harder to sustain when staff are expected to redesign their work without understanding the implications.

## Measure completed outcomes and keep redesigning

Before a pilot, agree what would count as improvement. Use a small set of measures covering the complete workflow:

- **Completion and delay:** completed cases, elapsed time, open work and the age of unresolved cases.
- **Quality and control:** correct outcomes, rework and consequential errors that escaped checks.
- **Human effort:** handling, review, exception resolution and ongoing support.
- **Economics:** implementation effort, recurring charges and cost per correctly completed case.
- **Service:** whether customers and receiving teams get what they need, when they need it.

Compare similar work and record changes in volume or complexity. Released staff time represents capacity; cash savings depend on an actual change in spending. The [workflow automation ROI guide](/blog/workflow-automation-roi/) explains that distinction.

As one stage improves, another may become the constraint. Review the process again rather than continuing to optimise the same task. The [bottleneck guide](/blog/identify-process-bottlenecks/) provides a practical observation method.

Start with one bounded workflow. Map the current journey, agree the intended design, test it with representative cases and widen use only when the evidence supports doing so. Keep an owner and budget for what happens after the initial implementation.

## Discuss the operating changes your AI workflow needs

Bring one workflow where AI is being considered or already used, together with a recent ordinary case and an exception. Include the people who understand how it reaches completion.

We help turn an AI initiative into a practical business improvement. We map the complete journey with your team, investigate where work waits and agree the responsibilities, decisions and system changes needed to reach the intended outcome.

Our work can continue through process redesign, solution implementation, testing and handover. That gives the initiative a defined route into everyday use, with an owner and measures for assessing the result. AI is one possible part of that solution.

[See how we improve business operations](/services/business-operations-improvement/), [deliver new business capabilities](/services/new-business-capabilities/) or [help delivery teams work more effectively](/services/delivery-team-effectiveness/).

[Discuss the improvement you need](/#contact).

## About the author

Jateen Narsai is the founder of Solvero, with 15 years of financial services experience across business and systems analysis, solution design and software delivery. He works through complex problems, connects business and technical teams, and carries agreed work from requirements through testing and handover.

[More about Jateen Narsai](/authors/jateen-narsai/).
