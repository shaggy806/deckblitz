import { defineCard } from "../define.js";

// EDHREC rank 22633.
//
// Rulings:
//   [2025-11-17] Lands are normally colorless permanents, even if they tap for mana of a certain
//     color.
//   [2025-11-17] The value of X is calculated only once, as Glister Bairn's ability resolves.
//   [2025-11-17] The colors are white, blue, black, red, and green. Colorless is not a color.

const TEXT =
  "Vivid — At the beginning of combat on your turn, another target creature you control gets +X/+X until end of turn, where X is the number of colors among permanents you control.";

export default defineCard({
  name: "Glister Bairn",
  manaCost: "{2}{G/U}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      // X read once, as it resolves (the ruling).
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { colorsAmong: { controlledBy: "you" } },
        toughness: { colorsAmong: { controlledBy: "you" } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
