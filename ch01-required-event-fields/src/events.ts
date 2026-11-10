// A structured event: a type, such as "payment.recorded", and named fields.
export type EventFields = Record<string, string | number | undefined>;

export interface RecordedEvent extends EventFields {
  type: string;
}

export interface EventSink {
  emit(type: string, fields: EventFields): void;
}

// Writes each event to standard output as one JSON line.
export const consoleSink: EventSink = {
  emit(type, fields) {
    console.log(JSON.stringify({ type, ...fields }));
  },
};

// Keeps each event in memory, so that a test can read what was emitted.
export function createRecordingSink(): EventSink & { events: RecordedEvent[] } {
  const events: RecordedEvent[] = [];
  return {
    events,
    emit(type, fields) {
      events.push({ ...fields, type });
    },
  };
}
