import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 23973.
//
// Rulings:
//   [2018-06-08] A nonlegendary creature can't be your commander, even if it has a "partner with"
//     ability.

const ATTACK_TEXT = "Whenever this creature attacks, attacking Warriors get +1/+1 until end of turn.";

export default defineCard({
  name: "Blaring Captain",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Azra", "Warrior"],
  power: 2,
  toughness: 2,
  pairing: { kind: "partner-with", name: "Blaring Recruiter" },
  text: `Partner with Blaring Recruiter (When this creature enters, target player may put Blaring Recruiter into their hand from their library, then shuffle.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Blaring Recruiter?",
        effect: {
          kind: "search-library",
          filter: { name: "Blaring Recruiter" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Blaring Recruiter, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Warrior", attacking: true },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
