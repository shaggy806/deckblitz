import { defineCard } from "../define.js";

// EDHREC rank 17830.
//
// Rulings:
//   [2016-07-13] You can't target the same creature twice to have it get +2/+0.
//   [2022-12-08] Casting a spell with madness ignores the timing rules based on the card's card
//     type.
//
// Nahiri's Stoneblades' two different slots, each also gaining first strike.
export default defineCard({
  name: "Abandon Reason",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  madness: { cost: "{1}{R}" },
  text: "Up to two target creatures each get +1/+0 and gain first strike until end of turn. (They deal combat damage before creatures without first strike.)\nMadness {1}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});
