import { defineCard } from "../define.js";

// EDHREC rank 20103.
//
// Battalion is part of the trigger condition (General Thunderbolt Ross's
// `whileCondition`): three or more attacking creatures as this one attacks.
// The exiled card's permission lasts while it stays exiled, this creature or
// no (the ruling — Neriv, Crackling Vanguard's shape), and is gated, each
// time it's used, on your having attacked with three or more creatures this
// turn (`"attackers"`: different creatures declared as attackers — one put
// onto the battlefield attacking was never declared). Normal costs and timing.

const BATTALION_TEXT =
  "Battalion — Whenever this creature and at least two other creatures attack, exile the top card of your library. During any turn you attacked with three or more creatures, you may play that card.";

export default defineCard({
  name: "Boros Strike-Captain",
  manaCost: "{1}{R/W}{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Soldier"],
  power: 3,
  toughness: 3,
  text: BATTALION_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        duration: "while-exiled",
        gate: { kind: "turn-stat", stat: "attackers", who: "you", atLeast: 3 },
      },
      resolve: null,
      text: BATTALION_TEXT,
    },
  ],
});
