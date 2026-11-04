import { defineCard } from "../define.js";

// Two commanders of different mana values are a choice as it resolves (the ruling).
export default defineCard({
  name: "Stinging Study",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "You draw X cards and you lose X life, where X is the mana value of a commander you own on the battlefield or in the command zone.",
  targets: [],
  effect: {
    kind: "choose-value",
    value: "commander-mana-value",
    then: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: "x" },
        { kind: "lose-life", amount: "x" },
      ],
    },
  },
});
