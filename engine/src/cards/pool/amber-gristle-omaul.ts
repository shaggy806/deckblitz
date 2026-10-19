import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever Amber Gristle O'Maul attacks, you may discard your hand. If you do, draw a card for each player being attacked.";

// Jackdaw's "you may discard your hand. If you do, draw …" — allowed with an
// empty hand (the ruling), decided as it resolves. The players being attacked
// are counted then: every attacking creature is the active player's, and the
// trigger's controller is that player, so they're the opponents attacked
// (`opponentsAttacked` — a planeswalker attacked isn't its controller).
export default defineCard({
  name: "Amber Gristle O'Maul",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  pairing: { kind: "choose-a-background" },
  text: `Haste\n${ATTACK_TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard your hand, then draw a card for each player being attacked?",
        effect: { kind: "discard-hand", who: "you" },
        then: { kind: "draw", amount: { opponentsAttacked: true } },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
