import { defineCard } from "../define.js";

// EDHREC rank 27652. Battlebond.
//
// Rulings:
//   [2018-06-08] The value of X is determined only as Impetuous Protege's last ability resolves.
//     Once that happens, the value of X won't change later in the turn even if the greatest power
//     among your opponents' tapped creatures changes.
//   [2018-06-08] If the greatest power among tapped creatures your opponents control is negative,
//     X is considered to be 0. The same is true if your opponents control no tapped creatures.
// X is read once as the trigger resolves (a `modify-pt` amount), and the
// `difference` with 0 holds it at 0 when the greatest power is negative.
const ATTACK_TEXT =
  "Whenever this creature attacks, it gets +X/+0 until end of turn, where X is the greatest power among tapped creatures your opponents control.";

export default defineCard({
  name: "Impetuous Protege",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 0,
  toughness: 4,
  pairing: { kind: "partner-with", name: "Proud Mentor" },
  text: `Partner with Proud Mentor (When this creature enters, target player may put Proud Mentor into their hand from their library, then shuffle.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Proud Mentor?",
        effect: {
          kind: "search-library",
          filter: { name: "Proud Mentor" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Proud Mentor, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: {
          difference: [
            { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "opponent", tapped: true } },
            0,
          ],
        },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
