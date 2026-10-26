import { defineCard } from "../define.js";

// EDHREC rank 27508.
//
// Rulings:
//   [2013-04-15] Once a battalion ability has triggered, it doesn't matter how many creatures are
//     still attacking when that ability resolves.
//   [2013-04-15] The effects of battalion abilities vary from card to card. Read each card
//     carefully.
//   [2024-01-12] The three attacking creatures don't have to be attacking the same player,
//     planeswalker, or battle.

const TEXT =
  "Battalion — Whenever this creature and at least two other creatures attack, this creature gains double strike until end of turn. (It deals both first-strike and regular combat damage.)";

export default defineCard({
  name: "Ordruun Veteran",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Soldier"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
