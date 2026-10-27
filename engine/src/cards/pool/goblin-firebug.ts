import { defineCard } from "../define.js";

// EDHREC rank 28919.

export default defineCard({
  name: "Goblin Firebug",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: "When this creature leaves the battlefield, sacrifice a land.",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: "When this creature leaves the battlefield, sacrifice a land.",
    },
  ],
});
