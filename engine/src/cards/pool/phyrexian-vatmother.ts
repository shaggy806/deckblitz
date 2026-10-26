import { defineCard } from "../define.js";

// EDHREC rank 13685.
export default defineCard({
  name: "Phyrexian Vatmother",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 4,
  toughness: 5,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nAt the beginning of your upkeep, you get a poison counter.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "you" },
      resolve: null,
      text: "At the beginning of your upkeep, you get a poison counter.",
    },
  ],
});
