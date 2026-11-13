// Structured events: one record for each meaningful step, with a type, such as
// "contact.added", and named fields. Which fields each type may carry is set
// in checks/telemetry-contract.json; the test in test/checks/ holds every
// event the code writes to that list.

export type EventFields = Record<string, string | number | boolean>;

export interface StructuredEvent {
  readonly type: string;
  readonly at: string;
  readonly fields: EventFields;
}

export interface EventSink {
  write(event: StructuredEvent): void;
}

// Writes each event to standard output as one line of JSON.
const consoleSink: EventSink = { write: (event) => console.log(JSON.stringify(event)) };
let sink: EventSink = consoleSink;

// Sends events somewhere else, such as a list a test reads. Returns a function that restores the console.
export function useEventSink(next: EventSink): () => void {
  sink = next;
  return () => {
    sink = consoleSink;
  };
}

export function recordEvent(type: string, fields: EventFields): void {
  sink.write({ type, at: new Date().toISOString(), fields });
}
