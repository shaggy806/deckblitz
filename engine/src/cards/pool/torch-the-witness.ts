import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

const TEXT =
  "Torch the Witness deals twice X damage to target creature. If excess damage was dealt to that creature this way, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Torch the Witness",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: { sum: ["x", "x"] }, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "excess-damage-this-way", to: 0 },
        then: investigate(),
      },
    ],
  },
});
