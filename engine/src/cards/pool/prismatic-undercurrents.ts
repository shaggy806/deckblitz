import { defineCard } from "../define.js";

// EDHREC rank 6861.
//
// Rulings:
//   [2025-11-17] The colors are white, blue, black, red, and green. Colorless is not a color.
//   [2025-11-17] The effect of Prismatic Undercurrents's last ability is cumulative with similar
//     effects.
//   [2025-11-17] The value of X is calculated only once, as Prismatic Undercurrents's first
//     ability resolves.
//   [2025-11-17] Lands are normally colorless permanents, even if they tap for mana of a certain
//     color.
//
// Sisay's `colorsAmong`, read as the trigger resolves (the enchantment
// itself counts if it's still there), as Nylea's Intervention's "up to X".
const VIVID_TEXT =
  "Vivid — When this enchantment enters, search your library for up to X basic land cards, where X is the number of colors among permanents you control. Reveal those cards, put them into your hand, then shuffle.";
const LAND_TEXT = "You may play an additional land on each of your turns.";

export default defineCard({
  name: "Prismatic Undercurrents",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${VIVID_TEXT}\n${LAND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: { colorsAmong: { controlledBy: "you" } },
        reveal: true,
      },
      resolve: null,
      text: VIVID_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, extraLandsPerTurn: 1, text: LAND_TEXT }],
});
