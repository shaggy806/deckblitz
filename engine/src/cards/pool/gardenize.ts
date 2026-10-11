import { defineCard } from "../define.js";

export default defineCard({
  name: "Gardenize",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever a creature you control dies, put a charge counter on this enchantment.\nAt the beginning of your first main phase, add {G} for each charge counter on this enchantment.",
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control dies, put a charge counter on this enchantment.",
    },
    {
      // Black Market's. Gone by then, the counters it last had count (the
      // ruling): `countersOn: "source"` reads its last-known information.
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: { countersOn: "source", counter: "charge" } },
      resolve: null,
      text: "At the beginning of your first main phase, add {G} for each charge counter on this enchantment.",
    },
  ],
});
