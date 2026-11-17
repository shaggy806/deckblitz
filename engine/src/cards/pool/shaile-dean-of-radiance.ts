import { defineCard } from "../define.js";

// Strixhaven (STX). The front face of Shaile, Dean of Radiance // Embrose, Dean of Shadow (a
// modal double-faced card).
//
// Rulings:
//   [2021-04-16] If a creature entered the battlefield under your control this turn but is
//     controlled by a different player when Shaile's activated ability resolves, it will still
//     get a +1/+1 counter.
//
// "Entered the battlefield under your control this turn" is the journal's `entered` entries in
// your own record (`journaled: { what: "entered", by: "you" }`, each its controller as it
// entered), for the object in the stint it's in now (rule 400.7) — whoever controls it now, so no
// `controlledBy`.

const COUNTERS_TEXT =
  "{T}: Put a +1/+1 counter on each creature that entered the battlefield under your control this turn.";

export default defineCard({
  name: "Shaile, Dean of Radiance",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${COUNTERS_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", journaled: { what: "entered", by: "you" } },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
  faces: ["Shaile, Dean of Radiance", "Embrose, Dean of Shadow"],
});
