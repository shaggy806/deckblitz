import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] Soul Sear can target a creature or planeswalker that doesn't have indestructible.

export default defineCard({
  name: "Soul Sear",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Soul Sear deals 5 damage to target creature or planeswalker. That permanent loses indestructible until end of turn.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "lose-keywords", target: 0, keywords: ["indestructible"], duration: "end-of-turn" },
    ],
  },
});
