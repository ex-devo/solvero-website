# AI or rules-based automation? How to choose for each workflow step

By [Jateen Narsai](author-jateen-narsai.md)

Choose AI or rules-based automation at the level of a specific task. Explicit rules suit agreed calculations, field checks and decision boundaries. AI can help interpret varied language or documents when its output can be checked and an uncertain result has a clear review route.

Many useful workflows combine both approaches. The business decision is whether a method improves the outcome after checking, correction and operating effort have been included.

![AI interprets varied information, explicit rules check agreed conditions, and an authorised person handles consequential judgement.](/images/blog/ai-vs-rules-based-automation/ai-rules-human.webp)

*Choose the method for each task and keep decision authority explicit.*

## Separate interpretation from authority

Consider an incoming service request. It may need to be read, categorised, linked to a customer, checked against the agreement and assigned to someone with the right responsibility.

Reading varied descriptions is different from deciding whether an extra charge has been approved. An AI-generated category can be a suggestion. Spending authority should follow the organisation's agreed policy and eligible decision makers.

Write down the input, expected output and consequence of a mistake for each step. If those are unclear, clarify the process before selecting a model or platform.

## Compare the task with the available methods

| Task | Starting approach to assess | What needs checking |
|---|---|---|
| Confirm a required form field exists | Explicit validation rule | Empty values, permitted formats and error messages |
| Compare an approved amount with a limit | Deterministic rule | Currency, comparable total and policy version |
| Suggest a category from varied request text | AI-assisted classification | Allowed categories, wrong routes and review effort |
| Extract stated details from varied documents | AI-assisted extraction or a suitable document parser | Source evidence, missing values and ambiguous fields |
| Resolve a disputed request or conflicting authority | Responsible human decision | Evidence, decision rights and recorded outcome |

A regular document format may be handled adequately by an existing parser. A clear request form may remove the need to classify an email at all. Include those options when comparing the value of AI.

## Work through a bounded intake example

**Illustrative design example:** a service business receives purchase-order messages in different formats. The first proposed AI task extracts an order reference, a requested delivery date and the final total explicitly stated in the message. It also returns the supporting source text for each field.

Rules then check required values, permitted formats and consistency with the receiving system. A person reviews the result during the pilot. Supplier approval, price agreement and payment authority remain separate decisions.

```text
Incoming message -> Preserve source and request reference
                            |
                 Extract candidate fields with evidence
                            |
                 Validate format and required values
                       /                 \
              Reviewable result       Missing or conflicting input
                       |                 |
                 Human review <----------+
                       |
                Approved mapped record -> Confirmed system update
```

This is a proposed evaluation flow, not a report of an executed model test or client implementation. The [task-selection worksheet](assets/ai-task-decision.csv) helps define comparable tasks and review decisions.

## Define correctness before running examples

For extraction, distinguish a value that appears in the source from a value someone could calculate or infer. If the task asks for the stated final total and none is present, a missing result may be correct.

Decide how to represent missing and conflicting values. Define which errors require review and which make the whole result unusable. Include the supporting source text so the reviewer can check the claim without searching the entire document again.

Structured output can help constrain the response format. It does not establish that the extracted content is correct. [OpenAI's Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs) explicitly notes that outputs can still contain mistakes. Treat format validation and content verification as separate checks.

![An AI extraction proposal links each candidate field to source evidence, while missing or conflicting information is routed for review.](/images/blog/ai-vs-rules-based-automation/extraction-with-evidence.webp)

*Require supporting evidence and a clear route for missing or conflicting information.*

## Use a test set that challenges the design

The [illustrative evaluation cases](assets/ai-intake-evaluation.csv) contain invented messages and expected handling. They cover missing totals, conflicting references, ambiguous dates, irrelevant text and instructions embedded inside a document.

The source message is data to inspect. A sentence telling the model to ignore its task or approve an order must not acquire authority over the workflow. Keep such cases in the evaluation and limit what an extraction step is allowed to do.

The CSV leaves actual outputs and results empty. Run it against the chosen implementation, record the model and configuration, and compare with the expected outcomes. Use additional held-out examples that were not used to tune the instructions. A small demonstration set can reveal mistakes without establishing a reliable production error rate.

Do not use the model's own statement of confidence as proof of accuracy. Decide review thresholds and routing using observed performance on representative work and the consequence of an error.

## Measure the full cost of using the result

Compare the same scoped task using a rule or parser, AI assistance and manual handling where appropriate. Include the time needed to review, correct and recover from failures.

Track the proportion of usable outputs, important errors missed by the checks, review minutes per case and operating cost. A fast response that requires longer correction can increase total work.

Separate evaluation costs from recurring use. Platform charges, model usage, document processing and support may all contribute. The [automation business-case guide](05-workflow-automation-roi.md) provides a way to keep the assumptions visible.

## Choose the operating boundary deliberately

After the pilot, decide which outputs can progress automatically, which require a person and which inputs should be excluded from the scope. Record how changes to the model, instructions or source format will be checked before release.

If review remains necessary for every result, assess whether the assisted process still helps. A useful pilot can also show that a simpler form, a better rule or a manual decision is the appropriate outcome.

For the surrounding workflow, the [onboarding guide](06-customer-onboarding-automation.md) explains readiness checks, while the [approval guide](03-approval-workflow-automation.md) explains decision authority.

## Assess the task before choosing the technology

Bring examples of the input, the decision or output you need, and the current checking effort. Solvero can help analyse the process and implement an approach suited to the work, including the review and system handoffs it needs.

[Explore Solvero's workflow automation service](https://solvero.co.za/services/workflow-automation/).

[Discuss where AI could help your workflow with Solvero](https://solvero.co.za/#contact).


## About the author

Jateen Narsai is an IT professional with over 15 years’ experience in business and systems analysis, process improvement and software solution design. His work includes customer onboarding, approval workflows and reporting automation. He works across requirements, solution documentation, testing and implementation support, with a focus on reducing manual effort and making systems easier to use.

[More about Jateen Narsai](author-jateen-narsai.md).
