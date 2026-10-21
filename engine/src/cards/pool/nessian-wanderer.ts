import { defineCard } from "../define.js";

// Theros Beyond Death.

const CONSTELLATION =
  "Constellation — Whenever an enchantment you control enters, look at the top three cards of your library. You may reveal a land card from among them and put that card into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Nessian Wanderer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Satyr", "Scout"],
  power: 1,
  toughness: 3,
  text: CONSTELLATION,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: CONSTELLATION,
    },
  ],
});
