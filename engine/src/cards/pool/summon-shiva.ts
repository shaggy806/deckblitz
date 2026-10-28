import { defineCard } from "../define.js";

// EDHREC rank 4919.

const CHAPTER_I_II =
  "I, II — Heavenly Strike — Tap target creature an opponent controls. Put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";
const CHAPTER_III = "III — Diamond Dust — Draw a card for each tapped creature your opponents control.";

export default defineCard({
  name: "Summon: Shiva",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Elemental"],
  power: 4,
  toughness: 5,
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1, 2],
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_I_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "draw", amount: { countOf: { type: "creature", tapped: true, controlledBy: "opponent" } } },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
