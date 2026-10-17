import { defineCard } from "../define.js";

// EDHREC rank 8564.
//
// Rulings:
//   [2023-10-13] Paradox abilities count any spells cast from zones other than your hand. These
//     are usually spells cast from exile, the graveyard, or the command zone. They also count
//     spells cast from outside the game, such as spells cast with Wish or Garth One-Eye's ability.
//   [2023-10-13] If a spell or ability allows you to copy a spell on the stack but doesn't specify
//     that the spell is cast, that spell wasn't cast and won't be counted by paradox abilities.
//     However, if a spell or ability allows you to cast a copy of a spell, that spell will be
//     counted for paradox abilities.
//
// Paradox is Flaming Tyrannosaurus's `notFrom: "hand"`. The targeted player
// discards then draws (slot 0 of each), then the counter goes on this creature.
const PARADOX_TEXT =
  "Paradox — Whenever you cast a spell from anywhere other than your hand, this creature deals 2 damage to target player. That player discards a card, then draws a card. Put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Memory Worm",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Alien", "Worm"],
  power: 1,
  toughness: 1,
  text: PARADOX_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", notFrom: "hand" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "discard", target: 0, amount: 1 },
          { kind: "draw", target: 0, amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: PARADOX_TEXT,
    },
  ],
});
