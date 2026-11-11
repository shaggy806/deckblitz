import { defineCard } from "../define.js";

// A Saga that will be under your control with Barbara on the battlefield
// chooses its chapter as it enters (rules 614.12, 702.155b); one entering at
// the same time as her doesn't.
const HISTORY_TEACHER =
  "History Teacher — Sagas you control have read ahead. (As a Saga enters, choose a chapter and start with that many lore counters. Skipped chapters don't trigger.)";

export default defineCard({
  name: "Barbara Wright",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 3,
  pairing: { kind: "doctors-companion" },
  text: `${HISTORY_TEACHER}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Saga", controlledBy: "you" } },
      grantKeywords: ["read-ahead"],
      text: HISTORY_TEACHER,
    },
  ],
});
