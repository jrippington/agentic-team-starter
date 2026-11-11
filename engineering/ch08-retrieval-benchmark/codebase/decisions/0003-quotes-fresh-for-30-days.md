# 0003. Quotes stay fresh for 30 days

Status: accepted.

## Context

Rates are reviewed monthly. A customer who accepts a quote months after it was made would be bound at a price worked out from rates that may since have changed.

## Decision

A quote can be accepted for 30 days after it was created. After that it is stale, and the customer asks for a new one.

## Consequences

Customers who take longer than 30 days to decide must ask again. Thirty days covers the ordinary time to compare quotes and still keeps every bound price within one rate review.
