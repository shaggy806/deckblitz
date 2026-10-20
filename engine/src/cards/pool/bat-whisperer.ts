import { defineCard } from "../define.js";

// EDHREC rank 20509.
//
// Rulings:
//   [2021-09-24] Bat Whisperer's ability cares whether an opponent lost life this turn, not how
//     their life total changed. For example, an opponent who gained 2 life and lost 1 life in the
//     same turn still lost life.
const TEXT =
  "When this creature enters, if an opponent lost life this turn, create a 1/1 black Bat creature token with flying.";

export default defineCard({
  name: "Bat Whisperer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Bat Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
