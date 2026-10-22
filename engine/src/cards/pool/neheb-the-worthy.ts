import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 16779.
//
// Rulings:
//   When Neheb's triggered ability resolves, first the player whose turn it is
//   chooses a card to discard, then each other player in turn order, then all
//   of those cards are discarded simultaneously.
//   Neheb is affected by its own power-modifying ability once you have one or
//   zero cards in hand.

const LORD = "Other Minotaurs you control have first strike.";
const PUMP = "As long as you have one or fewer cards in hand, Minotaurs you control get +2/+0.";
const TRIGGER = "Whenever Neheb deals combat damage to a player, each player discards a card.";

export default defineCard({
  name: "Neheb, the Worthy",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${LORD}\n${PUMP}\n${TRIGGER}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Minotaur" },
      grantKeywords: ["first-strike"],
      text: LORD,
    },
    {
      affects: { scope: "creatures-you-control", subtype: "Minotaur" },
      condition: { kind: "hand-size", atMost: 1 },
      grantPt: [2, 0],
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
