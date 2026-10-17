import { defineCard } from "../define.js";

// III: a delayed trigger on the next instant or sorcery spell with mana value
// 3 or less cast this turn — a bigger spell cast first doesn't use it up.
const CHAPTER_I = "I — Create a Cursed Role token attached to up to one target creature.";
const CHAPTER_II = "II — Scry 2.";
const CHAPTER_III =
  "III — When you next cast an instant or sorcery spell with mana value 3 or less this turn, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Gadwick's First Duel",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "create-token", token: "Cursed Role Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { nextSpell: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } } },
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
        text: "When you next cast an instant or sorcery spell with mana value 3 or less this turn, copy that spell. You may choose new targets for the copy.",
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
