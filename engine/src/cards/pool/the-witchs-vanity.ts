import { defineCard } from "../define.js";

const CHAPTER_I = "I — Destroy target creature an opponent controls with mana value 2 or less.";
const CHAPTER_II = "II — Create a Food token.";
const CHAPTER_III = "III — Create a Wicked Role token attached to target creature you control.";

export default defineCard({
  name: "The Witch's Vanity",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [
        { kind: "permanent", whose: "opponent", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: ["creature-you-control"],
      effect: { kind: "create-token", token: "Wicked Role Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
