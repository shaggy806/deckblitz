import { defineCard } from "../define.js";

const CHAPTER_I = "I, II — Target player mills two cards, then exiles their graveyard.";
const CHAPTER_III =
  "III — Put all creature cards exiled with this enchantment onto the battlefield face down under your control. They're 2/2 Cyberman artifact creatures.";

// The graveyards are exiled linked to the Saga (rule 607.2a), which chapter III
// reads; "all" is every creature card among them, no choice.
export default defineCard({
  name: "Death in Heaven",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1, 2],
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: 0, amount: 2 },
          { kind: "exile-graveyard", target: 0, linked: true },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 999,
        max: 999,
        filter: { type: "creature" },
        destination: "battlefield",
        under: "you",
        enterAs: { faceDown: "2/2 Cyberman artifact creature" },
        leftover: "stay",
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
