import { defineCard } from "../define.js";

// Rulings:
//   You must follow normal time restrictions for cards cast using Fire Lord Ozai's activated ability.

const ATTACK_TEXT =
  "Whenever Fire Lord Ozai attacks, you may sacrifice another creature. If you do, add an amount of {R} equal to the sacrificed creature's power. Until end of combat, you don't lose this mana as steps end.";
const EXILE_TEXT =
  "{6}: Exile the top card of each opponent's library. Until end of turn, you may play one of those cards without paying its mana cost.";

export default defineCard({
  name: "Fire Lord Ozai",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 4,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "each-opponent",
        duration: "end-of-turn",
        play: true,
        free: true,
        upTo: 1,
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "add-mana",
          mana: "R",
          amount: { powerOf: { paid: "sacrificed" } },
          untilEndOfCombat: true,
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
