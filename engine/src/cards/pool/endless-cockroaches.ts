import { defineCard } from "../define.js";

// EDHREC rank 13021.

const TEXT = "When this creature dies, return it to its owner's hand.";

export default defineCard({
  name: "Endless Cockroaches",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
