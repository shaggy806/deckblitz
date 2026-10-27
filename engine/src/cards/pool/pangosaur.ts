import { defineCard } from "../define.js";

const TEXT = "Whenever a player plays a land, return this creature to its owner's hand.";

export default defineCard({
  name: "Pangosaur",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "plays-land", who: "any" },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
