# Rule card: the rule's name

Checks in `npm run verify`: the name of each check that enforces it.

| Field | What to write |
|---|---|
| What the rule says | The rule in one sentence, precise enough for a machine to test if it is to be checked |
| Why | What breaks if it is violated, and for whom |
| Who owns it | The named owner who approves changes to the rule and grants its exceptions, with a deputy |
| Its rung | One of six: unstated, stated, grounded, structured, checked or governed |
| How it is checked | The check, and when it runs |
| The bad change that shows the check can fail | The planted change in `planted/`, or another recorded bad change; "none yet" means the card is not finished |
| What the check cannot see | At least one thing, with the review that covers it |
| How an exception is granted | A waiver in `checks/waivers.json`, with its owner and expiry, or "none", with the reason |
| Its decision record | The record in `decisions/` of what was decided, why, and what it now misses |
| Its review date | When the owner next asks whether the rule is still right |
| Where it runs | On whose machine and in which pipeline, under which command |
| The evidence it produces | What the check prints when it fails |
| Its cost | How long it takes, on a stated run |
