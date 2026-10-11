import { defineCard } from "../define.js";

// EDHREC rank 12677.
//
// Rulings:
//   [2026-08-21] Ghalta the Unstoppable's cost reduction ability can't reduce the total cost to
//     cast the spell below {G}.
//   [2026-08-21] The first step of casting a spell is to move it to the stack. If this causes the
//     greatest power of creatures you control to change (perhaps because you control a creature
//     whose power is determined by the number of cards in your hand), that new power will be used
//     to determine the cost reduction.
//   [2026-08-21] Once you announce you're casting a spell, no player may take actions until the
//     spell has been paid for. Notably, opponents can't try to reduce the power of creatures you
//     control.
//   [2026-08-21] Ghalta the Unstoppable's mana value doesn't change no matter what the greatest
//     power of creatures you control is.
//   [2026-08-21] Once you determine the cost to cast Ghalta the Unstoppable, you may activate mana
//     abilities to pay that cost. If the greatest power of creatures you control changes while
//     activating mana abilities, the cost to cast Ghalta remains what you previously determined.

const COST_TEXT =
  "This spell costs {X} less to cast, where X is the greatest power among creatures you control.";
const TRAMPLE_TEXT = "Other creatures you control have trample.";

export default defineCard({
  name: "Ghalta the Unstoppable",
  manaCost: "{8}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dinosaur"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  text: `${COST_TEXT}\nTrample\n${TRAMPLE_TEXT}`,
  // The Great Henge's shape: unconditional, and only the generic part comes
  // off, so {G} is always paid (the ruling; rule 601.2f).
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: {
      aggregate: "max",
      of: "power",
      filter: { type: "creature", controlledBy: "you" },
    },
  },
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
});
