import { defineCard } from "../define.js";

// The delirium ability has no intervening if (its ruling): it triggers every
// upkeep and checks the graveyard as it resolves.

export default defineCard({
  name: "Mindwrack Demon",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 5,
  keywords: ["flying", "trample"],
  text: "Flying, trample\nWhen this creature enters, mill four cards.\nDelirium — At the beginning of your upkeep, you lose 4 life unless there are four or more card types among cards in your graveyard.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 4 },
      resolve: null,
      text: "When this creature enters, mill four cards.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "delirium" } },
        then: { kind: "lose-life", amount: 4 },
      },
      resolve: null,
      text: "Delirium — At the beginning of your upkeep, you lose 4 life unless there are four or more card types among cards in your graveyard.",
    },
  ],
});
