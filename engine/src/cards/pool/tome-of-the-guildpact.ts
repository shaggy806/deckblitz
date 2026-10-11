import { defineCard } from "../define.js";

// EDHREC rank 6779.
//
// Rulings:
//   [2019-01-25] Tome of the Guildpact's ability resolves before the spell that caused it to
//     trigger. It resolves even if that spell is countered.
//
// A spell is multicoloured with two or more colours (rule 105.4), read off the
// spell on the stack as it's cast.
const DRAW_TEXT = "Whenever you cast a multicolored spell, draw a card.";
const MANA_TEXT = "{T}: Add one mana of any color.";

export default defineCard({
  name: "Tome of the Guildpact",
  manaCost: "{5}",
  types: ["artifact"],
  subtypes: ["Book"],
  text: `${DRAW_TEXT}\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { multicolored: true } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
