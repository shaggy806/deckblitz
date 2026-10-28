import { defineCard } from "../define.js";

// EDHREC rank 16289.
//
// Rulings:
//   [2008-04-01] The second ability is cumulative. That is, each creature you control with any
//     +1/+1 counters on it can block an additional creature for each Cenn's Tactician you control.
//     Cenn's Tactician doesn't care whether the creature has any +1/+1 counters on it beyond the
//     first.

const BLOCK_TEXT = "Each creature you control with a +1/+1 counter on it can block an additional creature each combat.";

export default defineCard({
  name: "Cenn's Tactician",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 1,
  toughness: 1,
  text: `{W}, {T}: Put a +1/+1 counter on target Soldier creature.\n${BLOCK_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Soldier" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{W}, {T}: Put a +1/+1 counter on target Soldier creature.",
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      blockAdditional: 1,
      text: BLOCK_TEXT,
    },
  ],
});
