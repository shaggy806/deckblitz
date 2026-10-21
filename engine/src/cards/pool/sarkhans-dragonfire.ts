import { defineCard } from "../define.js";

export default defineCard({
  name: "Sarkhan's Dragonfire",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Sarkhan's Dragonfire deals 3 damage to any target.\nLook at the top five cards of your library. You may reveal a red card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { colors: ["R"] },
        destination: "hand",
        leftover: "bottom-random",
      },
    ],
  },
});
