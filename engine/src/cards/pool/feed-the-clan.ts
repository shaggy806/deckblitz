import { defineCard } from "../define.js";

// EDHREC rank 13751.
//
// "Instead": with ferocious you gain only the 10 (the ruling), read as it
// resolves.

export default defineCard({
  name: "Feed the Clan",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You gain 5 life.\nFerocious — You gain 10 life instead if you control a creature with power 4 or greater.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
    then: { kind: "gain-life", amount: 10 },
    else: { kind: "gain-life", amount: 5 },
  },
});
