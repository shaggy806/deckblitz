import { defineCard } from "../define.js";

// EDHREC rank 23350.
//
// The reduction takes generic mana only, so it never reduces the {W}.
export default defineCard({
  name: "Wall Off",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "This spell costs {1} less to cast for each creature your opponents control.\nCreate a 0/4 colorless Wall creature token with defender. You gain 4 life.",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "creature", controlledBy: "opponent" } },
  },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Wall Token (The Fantastic Four)", count: 1 },
      { kind: "gain-life", amount: 4 },
    ],
  },
});
