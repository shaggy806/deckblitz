import { defineCard } from "../define.js";

// Chapter II's "if you can't" is "if no artifact card went to your hand": the
// choice must take one when there is one.

const CHAPTER_I = "I — Return up to one target creature or planeswalker to its owner's hand.";
const CHAPTER_II = "II — Return an artifact card from your graveyard to your hand. If you can't, draw a card.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "Inventive Iteration",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["Inventive Iteration", "Living Breakthrough"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { type: "artifact" },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-into-hand", atMost: 0 },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
