import { defineCard } from "../define.js";

// EDHREC rank 24036.

export default defineCard({
  name: "Diseased Vermin",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 1,
  text:
    "Whenever this creature deals combat damage to a player, put an infection counter on it.\nAt the beginning of your upkeep, this creature deals X damage to target opponent previously dealt damage by it, where X is the number of infection counters on it.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      resolve: null,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "infection", amount: 1 },
      text: "Whenever this creature deals combat damage to a player, put an infection counter on it.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      resolve: null,
      // "Previously dealt damage by it": any damage, on any turn, by this
      // object (rule 400.7) — the journal's whole-game record.
      targets: [{ kind: "player-dealt-damage-by-source", ever: true, opponent: true }],
      effect: { kind: "damage", target: 0, amount: { countersOn: "source", counter: "infection" } },
      text: "At the beginning of your upkeep, this creature deals X damage to target opponent previously dealt damage by it, where X is the number of infection counters on it.",
    },
  ],
});
