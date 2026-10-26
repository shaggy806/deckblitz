import { defineCard } from "../define.js";

// EDHREC rank 30106.
//
// Rulings:
//   [2013-04-15] Once a battalion ability has triggered, it doesn't matter how many creatures are
//     still attacking when that ability resolves.
//   [2013-04-15] The effects of battalion abilities vary from card to card. Read each card
//     carefully.
//   [2024-01-12] The three attacking creatures don't have to be attacking the same player,
//     planeswalker, or battle.

export default defineCard({
  name: "Nav Squad Commandos",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 5,
  text: "Battalion — Whenever this creature and at least two other creatures attack, this creature gets +1/+1 until end of turn. Untap it.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "untap", target: "source" },
        ],
      },
      resolve: null,
      text: "Battalion — Whenever this creature and at least two other creatures attack, this creature gets +1/+1 until end of turn. Untap it.",
    },
  ],
});
