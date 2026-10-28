import { defineCard } from "../define.js";

// EDHREC rank 20099. Chapter I's "doesn't untap" lasts for as long as the
// Saga stays on the battlefield (`while-source`), so it ends when the Saga is
// sacrificed after III.
const CHAPTER_I =
  "I — Tap up to one target creature. It doesn't untap during its controller's untap step for as long as this Saga remains on the battlefield.";
const CHAPTER_II = "II — Draw two cards.";
const CHAPTER_III = "III — You may put an artifact card with mana value 5 or less from your hand onto the battlefield.";

export default defineCard({
  name: "Origin of Iron Man",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source" },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "artifact", manaValue: { op: "lte", n: 5 } },
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
