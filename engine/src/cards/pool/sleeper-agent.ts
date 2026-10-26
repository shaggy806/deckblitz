import { defineCard } from "../define.js";

// Urza's Saga. "You" in the upkeep trigger is its controller — the opponent
// who was given it (the ruling), so it hurts them on their own upkeep.
export default defineCard({
  name: "Sleeper Agent",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Minion"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, target opponent gains control of it.\nAt the beginning of your upkeep, this creature deals 2 damage to you.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
      resolve: null,
      text: "When this creature enters, target opponent gains control of it.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "you" },
      resolve: null,
      text: "At the beginning of your upkeep, this creature deals 2 damage to you.",
    },
  ],
});
