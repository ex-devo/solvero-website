# How to find bottlenecks in a business process before automating it

By [Jateen Narsai](author-jateen-narsai.md)

To find a process bottleneck, follow real cases through the workflow and measure where work accumulates. Separate active handling from waiting and repeated work. Then check whether the suspected stage limits completed output, rather than choosing the task that looks busiest.

You can start with a spreadsheet and observations. A process-mining platform can help when reliable event data exists, but the first questions are the same: what entered the process, what completed, what remains open and why?

## Define a start and a finish

Choose one recognisable item, such as a service-change request. Set the boundary from “complete request received” to “authorised change handed to delivery”. Keep incomplete submissions visible as a separate entry state so their delay is not lost.

Give every case a reference. Record the time it enters a stage, when work starts and when the stage finishes. Use a consistent time zone, and specify whether elapsed time includes evenings and non-working days. Active minutes and calendar hours answer different questions.

Include people doing the work in this observation. Ask them to show a recent ordinary case and one that needed correction. The written procedure may leave out the spreadsheet, missing attachment or second review they use to get the job finished.

## Separate three kinds of time

| Measure | What it tells you | Common measurement mistake |
|---|---|---|
| Active handling | Time someone spends doing the work | Counting the whole time a task is assigned as working time |
| Waiting | Time before the next action starts | Treating overnight waiting as staff capacity that can be recovered |
| Rework | Additional handling caused by a return or correction | Counting the same minutes in both handling and a separate savings claim |

For a simple sequential case, elapsed time can be divided into active work and waiting. Parallel work needs a timeline: adding overlapping stage durations will overstate the customer's total wait.

[WorkFusion's process analysis documentation](https://doc.workfusion.com/enterprise/docs/iac/analytics/process-understanding-throughput-managing-bottlenecks/) similarly distinguishes processing, cycle and wait metrics. The worksheet here is a manual starting point, independent of that product.

## Follow one case, then test whether it is typical

**Illustrative example with invented inputs:** a service-change request moves through four sequential stages during one working day. There are no overlapping tasks or pauses outside the recorded stages.

| Stage | Waiting minutes | Active minutes | Stage elapsed minutes |
|---|---:|---:|---:|
| Check request details | 30 | 10 | 40 |
| Assess the change | 120 | 15 | 135 |
| Obtain approval | 240 | 20 | 260 |
| Prepare delivery handoff | 10 | 5 | 15 |
| Total | 400 | 50 | 450 |

The case takes seven hours and thirty minutes overall, with fifty minutes of active handling. Approval contains the longest wait. That makes it a place to investigate; one case does not establish that approval is the recurring capacity constraint.

Check whether approvals arrive faster than they are completed, whether the queue grows and how old the open requests become. A stage can also wait because reviews happen in batches or the required information arrives late. Those causes need different changes.

Use the [observation worksheet](assets/bottleneck-observation-blank.csv) and [worked timeline](assets/bottleneck-observation-worked.csv) to make the evidence inspectable. Keep unknown timestamps blank and mark them as unknown. Do not enter zero to make an incomplete record look finished.

## Inspect the queue as well as completed work

A report containing only finished cases can hide the requests that have been stuck longest. At each review, record arrivals, completions, open cases and the age of the oldest unresolved case.

Reconcile the counts for a fixed boundary:

**Closing open cases = opening open cases + new arrivals − completions − other exits.**

Record cancellations and transfers as other exits with a reason. In an illustrative period with six opening cases, ten arrivals, eight completions and one cancellation, seven remain open. A growing queue is evidence to investigate alongside workload and available capacity.

Look at the distribution of completion times. A median describes a typical completed case; the longest waits show a different experience. Split ordinary cases from requests needing missing information, specialist review or correction. Keep the definition and sample size visible when comparing periods.

## Turn an observation into a testable cause

“Approvals are slow” is a symptom. A more useful explanation identifies a condition you can check: requests wait for the weekly meeting, the authorised approver is unclear, or reviewers must ask for information the form never collects.

For each suspected cause, record the supporting cases and what would disprove it. If most waiting occurs before the request reaches the approver, adding reminders to the approval task will miss that delay.

Choose a change matched to the evidence. Improve the submission checklist when inputs are incomplete. Clarify authority when requests circulate between reviewers. Automate routing when the route is agreed and repeated manual forwarding is the problem. The [approval workflow guide](03-approval-workflow-automation.md) covers that last design in detail.

## Change one condition and observe again

Agree the comparison period and measures before making the change. Compare similar request types and note changes in volume, staffing, policy or complexity that could explain the result.

Track completed output and unresolved work alongside waiting time. Clearing a queue by rejecting valid requests would improve one number while harming the process. Check quality, rework and the receiving team's workload as well.

Once the cause is clearer, use the [automation scorecard](01-which-processes-to-automate.md) to assess implementation readiness. Use the [business-case model](05-workflow-automation-roi.md) to compare the likely benefit with the effort and ongoing cost.

## Discuss a workflow that keeps getting stuck

Bring a recent request, the stages it passed through and whatever timing evidence you have. Solvero can help analyse the delay, agree a practical change and implement the supporting workflow or system connections.

[Explore Solvero's workflow automation service](https://solvero.co.za/services/workflow-automation/).

[Discuss your process bottleneck with Solvero](https://solvero.co.za/#contact).


## About the author

Jateen Narsai is an IT professional with over 15 years’ experience in business and systems analysis, process improvement and software solution design. His work includes customer onboarding, approval workflows and reporting automation. He works across requirements, solution documentation, testing and implementation support, with a focus on reducing manual effort and making systems easier to use.

[More about Jateen Narsai](author-jateen-narsai.md).
