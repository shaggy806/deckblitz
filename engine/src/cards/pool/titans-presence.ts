import { defineCard } from "../define.js";

// EDHREC rank 3481. The target's power is checked as the spell resolves; if
// it's greater, nothing happens (the ruling). The revealed card's power is
// read in the hand, or as it last existed there (the ruling —
// `{ powerOf: "revealed" }`).

const COST = "As an additional cost to cast this spell, reveal a colorless creature card from your hand.";
const TEXT = "Exile target creature if its power is less than or equal to the revealed card's power.";

export default defineCard({
  name: "Titan's Presence",
  manaCost: "{3}",
  colors: [],
  types: ["instant"],
  text: `${COST}\n${TEXT}`,
  additionalCost: {
    behold: { filter: { type: "creature", colorless: true }, text: "a colorless creature card", fromHand: true },
  },
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: {
      kind: "target",
      index: 0,
      filter: { power: { op: "lte", n: { amount: { powerOf: "revealed" } } } },
    },
    then: { kind: "exile", target: 0 },
  },
});
