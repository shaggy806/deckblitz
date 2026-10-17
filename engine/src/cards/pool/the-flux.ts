import { defineCard } from "../define.js";

// Rulings:
//   [2023-10-13] You must pay all costs and follow all normal timing rules to play a card with The
//     Flux's middle chapter abilities. For example, you can play a land exiled this way only
//     during your main phase while the stack is empty.

const I_TEXT = "I — This Saga deals 4 damage to target creature an opponent controls.";
const MIDDLE_TEXT = "II, III, IV, V — Exile the top card of your library. You may play that card this turn.";
const VI_TEXT = "VI — Add six {R}.";

export default defineCard({
  name: "The Flux",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after VI.)\n" +
    `${I_TEXT}\n${MIDDLE_TEXT}\n${VI_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2, 3, 4, 5],
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: MIDDLE_TEXT,
    },
    {
      at: [6],
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 6 },
      resolve: null,
      text: VI_TEXT,
    },
  ],
});
