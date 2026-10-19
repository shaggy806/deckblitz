import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, exile the top card of each player's library. You may play those cards this turn, and you may spend mana as though it were mana of any color to cast those spells.";
const BLITZ_TEXT =
  'Blitz {2}{R} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';

// Ruling: cards played this way follow the normal timing rules — a land only
// as your land play.
export default defineCard({
  name: "Mezzio Mugger",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Rogue"],
  power: 3,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${BLITZ_TEXT}`,
  blitz: { cost: "{2}{R}" },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "each-player",
        duration: "end-of-turn",
        spendAs: "any-color",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
