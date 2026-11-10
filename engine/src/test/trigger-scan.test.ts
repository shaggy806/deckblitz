import { describe, expect, it } from "vitest";
import { TRIGGER_EVENTS } from "../trigger-events.js";

// `Game.emit` runs no trigger scan for the two priority events (the bot
// audit's S6: they are most of a quiet turn's events, and the whole-board scan
// for each was 16-25% of a rollout). That holds while nothing can trigger on
// them. The `TriggerSpec` kinds each test the event's type by hand in
// `triggerKindMatches`; the generic `{ on: "event" }` kind reads this table,
// so a row for either event would be an ability that never fires.
describe("the trigger scan skips priority events", () => {
  it("no trigger event is a priority event", () => {
    const types = Object.values(TRIGGER_EVENTS).map((row) => row.type as string);
    expect(types.length).toBeGreaterThan(10);
    expect(types).not.toContain("priority-passed");
    expect(types).not.toContain("priority-received");
  });
});
