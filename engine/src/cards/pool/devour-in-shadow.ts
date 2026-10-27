import { defineCard } from "../define.js";

// EDHREC rank 18211.
//
// "That creature's toughness" is read as it last existed on the battlefield
// (`toughnessOf`), once it's been destroyed.

export default defineCard({
  name: "Devour in Shadow",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature. It can't be regenerated. You lose life equal to that creature's toughness.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      { kind: "lose-life", amount: { toughnessOf: 0 } },
    ],
  },
});
