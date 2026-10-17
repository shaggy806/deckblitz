import { defineCard } from "../define.js";

// EDHREC rank 12463.
//
// Rulings:
//   [2023-09-01] You may choose a creature that's already tapped as the target of Galvanic Giant's
//     ability. If the target creature is already tapped as it resolves, you will still put a stun
//     counter on it.
//
// Constrictor Sage's tap-and-stun on a cast trigger (Lurking Lizards' shape):
// the target is any creature an opponent controls, tapped or not, and the
// counter goes on either way.

const STUN_TEXT =
  "Whenever you cast a spell with mana value 5 or greater, tap target creature an opponent controls and put a stun counter on it.";

export default defineCard({
  name: "Galvanic Giant",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Giant", "Wizard"],
  power: 3,
  toughness: 3,
  text: STUN_TEXT,
  faces: ["Galvanic Giant", "Storm Reading"],
  adventure: true,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 5 } } },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: STUN_TEXT,
    },
  ],
});
