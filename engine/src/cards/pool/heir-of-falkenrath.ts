import { defineCard } from "../define.js";

export default defineCard({
  name: "Heir of Falkenrath",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 1,
  text: "Discard a card: Transform this creature. Activate only once each turn.",
  faces: ["Heir of Falkenrath", "Heir to the Night"],
  transform: true,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "Discard a card: Transform this creature. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
