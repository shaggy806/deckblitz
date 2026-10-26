import { defineCard } from "../define.js";

// EDHREC rank 29982.
//
// Rulings:
//   [2013-04-15] Once a battalion ability has triggered, it doesn't matter how many creatures are
//     still attacking when that ability resolves.
//   [2013-04-15] The effects of battalion abilities vary from card to card. Read each card
//     carefully.
//   [2024-01-12] The three attacking creatures don't have to be attacking the same player,
//     planeswalker, or battle.

export default defineCard({
  name: "Warmind Infantry",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Soldier"],
  power: 2,
  toughness: 3,
  text: "Battalion — Whenever this creature and at least two other creatures attack, this creature gets +2/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Battalion — Whenever this creature and at least two other creatures attack, this creature gets +2/+0 until end of turn.",
    },
  ],
});
