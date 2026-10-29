import { defineCard } from "../define.js";

// EDHREC rank 11222.
//
// Rulings:
//   [2024-03-08] For example, when Legate Lanius's first ability resolves, an opponent who
//     controls between one and ten creatures will sacrifice one creature. An opponent who controls
//     between eleven and twenty creatures will sacrifice two creatures, and so on.

const DECIMATE_TEXT =
  "Decimate — When Legate Lanius enters, each opponent sacrifices a tenth of the creatures they control of their choice, rounded up.";
const GROW_TEXT = "Whenever an opponent sacrifices a creature, put a +1/+1 counter on Legate Lanius.";

export default defineCard({
  name: "Legate Lanius, Caesar's Ace",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${DECIMATE_TEXT}\n${GROW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "each-opponent",
        filter: { type: "creature" },
        count: {
          half: { countOf: { type: "creature", controlledBy: "you" }, forEachPlayer: true },
          round: "up",
          fraction: 10,
        },
      },
      resolve: null,
      text: DECIMATE_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
