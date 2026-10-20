import { defineCard } from "../define.js";

// EDHREC rank 19891.
//
// Rulings:
//   [2021-09-24] Bloodtithe Collector's triggered ability cares whether an opponent lost life this
//     turn, not how their life total changed. For example, an opponent who gained 2 life and lost 1
//     life in the same turn still lost life.
const TEXT = "When this creature enters, if an opponent lost life this turn, each opponent discards a card.";

export default defineCard({
  name: "Bloodtithe Collector",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
