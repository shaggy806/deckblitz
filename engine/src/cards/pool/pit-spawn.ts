import { defineCard } from "../define.js";

// EDHREC rank 29201.
//
// Rulings:
//   [2004-10-04] Since this card has First Strike it will often deal damage during first strike
//     damage dealing and its ability will exile the creature it damages before that creature can
//     deal damage back.

export default defineCard({
  name: "Pit Spawn",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 4,
  keywords: ["first-strike"],
  text: "First strike\nAt the beginning of your upkeep, sacrifice this creature unless you pay {B}{B}.\nWhenever this creature deals damage to a creature, exile that creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{B}{B}", text: "Pay {B}{B}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice this creature unless you pay {B}{B}.",
    },
    {
      trigger: { on: "deals-damage", who: "self", to: "creature" },
      targets: [],
      effect: { kind: "exile", target: "trigger-recipient" },
      resolve: null,
      text: "Whenever this creature deals damage to a creature, exile that creature.",
    },
  ],
});
