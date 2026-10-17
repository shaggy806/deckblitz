import { defineCard } from "../define.js";

const CHAPTER_I = "I — You and target opponent each create a Food token.";
const CHAPTER_II = "II — Each opponent loses 3 life. Create a Treasure token.";
const CHAPTER_III = "III — Create three tapped 1/1 white Spirit creature tokens with flying.";

export default defineCard({
  name: "Oath of the Grey Host",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "create-token", token: "Food Token", count: 1 },
          { kind: "create-token", token: "Food Token", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 3, who: "each-opponent" },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 3, tapped: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
