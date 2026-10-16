import { defineCard } from "../define.js";

// EDHREC rank 15834.
//
// Rulings:
//   [2024-04-12] Spells that were cast before Shackle Slinger entered the battlefield count. If
//     Shackle Slinger was the first spell you cast this turn, the next spell you cast this turn is
//     your second spell.

const TEXT =
  "Whenever you cast your second spell each turn, choose target creature an opponent controls. If it's tapped, put a stun counter on it. Otherwise, tap it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Shackle Slinger",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      // Spells cast before it entered count (the ruling): `nthEachTurn` reads
      // the turn's cast count, not what it has seen.
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: ["creature-an-opponent-controls"],
      // Whether it's tapped is read as the ability resolves.
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { tapped: true } },
        then: { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        else: { kind: "tap", target: 0 },
      },
      resolve: null,
      text: "Whenever you cast your second spell each turn, choose target creature an opponent controls. If it's tapped, put a stun counter on it. Otherwise, tap it.",
    },
  ],
});
