import { defineCard } from "../define.js";

// EDHREC rank 6753.
//
// Rulings:
//   Summon: G.F. Ifrit's third and fourth chapter abilities aren't mana abilities. They use the
//     stack and can be responded to.
//   (and the Saga rulings — see Summon: Fat Chocobo)
//
// Summon: Fat Chocobo's Saga-creature shape. Chapter I/II is Sarkhan,
// Fireblood's rummage; chapter III/IV is The Legend of Roku's chapter mana —
// a triggered ability, not a mana ability, so it uses the stack (rule 605.5a).
const CHAPTER_I_II = "I, II — You may discard a card. If you do, draw a card.";
const CHAPTER_III_IV = "III, IV — Add {R}.";

export default defineCard({
  name: "Summon: G.F. Ifrit",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Demon"],
  power: 3,
  toughness: 2,
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${CHAPTER_I_II}\n${CHAPTER_III_IV}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: CHAPTER_I_II,
    },
    {
      at: [3, 4],
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: CHAPTER_III_IV,
    },
  ],
});
