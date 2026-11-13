# Intent page

The architectural decisions for this system, written down before the first change and kept beside the code. Work through the eight steps with the system in front of you, one area at a time on a large system. Steps 1 to 7 each add lines to the page; step 8 adds a column to every line.

Later, mark every line in that column: checked (with the name of the check), in the residual judgement register (with who reviews it), or not yet decided.

## 1. Name the business capabilities

The things the business does, in the business's own words, not the code's.

| Capability | Checked today by |
|---|---|
| | |

## 2. For each fact the business would argue about, write which part of the system writes it

| Fact | Written by | Checked today by |
|---|---|---|
| | | |

## 3. List everything that happens in time

Notifications from outside systems, retries, scheduled jobs, and anything that can arrive twice or late.

| What happens | Checked today by |
|---|---|
| | |

## 4. List the promises

Interfaces other code calls, schemas, events, and anything else that code outside a change depends on.

| Promise | Who depends on it | Checked today by |
|---|---|---|
| | | |

## 5. Write what you would need to see at three in the morning

When something has gone wrong in production and you are called to fix it, what would you need to see to know what happened?

| What you would need to see | Checked today by |
|---|---|
| | |

## 6. Write down who is allowed to do what, and where the code checks it

| Who | May do what | Where the code checks it | Checked today by |
|---|---|---|---|
| | | | |

## 7. Name the paths that must stay fast or cheap, and what each may cost

| Path | What it may cost | Checked today by |
|---|---|---|
| | | |

## 8. Against each item, write whether anything checks it today

Fill in the last column of every table above. Most lines will say that nothing does yet; those lines are the work still to do.
