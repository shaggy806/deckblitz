import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 15764.
// Chapter III is Boseiju Reaches Skyward's shape: it comes back as Vector Glider.

const I_II_TEXT = "I, II — Draw a card, then discard a card.";
const III_TEXT = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "The Modern Age",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${I_II_TEXT}\n${III_TEXT}`,
  faces: ["The Modern Age", "Vector Glider"],
  transform: true,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: I_II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
