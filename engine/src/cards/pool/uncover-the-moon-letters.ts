import { defineCard } from "../define.js";

// EDHREC rank 12908.
//
// X is the mana spent to cast the triggering spell (its own record, so a
// spell countered in response still counts what was paid). Declining the
// draw skips the discard ("If you do").
const TEXT =
  "Whenever you cast a noncreature spell, you may draw X cards, where X is the amount of mana spent to cast that spell. If you do, discard two cards.";

export default defineCard({
  name: "Uncover the Moon-Letters",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw X cards, then discard two cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: { manaSpentOf: "trigger-object" } },
            { kind: "discard", target: "you", amount: 2 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
