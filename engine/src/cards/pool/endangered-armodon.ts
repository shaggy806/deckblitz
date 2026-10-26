import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 32043. A state trigger (rule 603.8), Goblins
// of the Flarg's shape. A trigger's condition counts its own permanent, so the
// Armodon itself shrunk to toughness 2 or less sets it off too.

const SAC = "When you control a creature with toughness 2 or less, sacrifice this creature.";

export default defineCard({
  name: "Endangered Armodon",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 4,
  toughness: 5,
  text: SAC,
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "controls", filter: { type: "creature", toughness: { op: "lte", n: 2 } }, atLeast: 1 },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC,
    },
  ],
});
