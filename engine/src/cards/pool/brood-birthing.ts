import { defineCard } from "../define.js";

// Rulings: whether you control an Eldrazi Spawn is checked as it resolves; the
// single token is the same 0/1 Eldrazi Spawn with its mana ability.
export default defineCard({
  name: "Brood Birthing",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: 'If you control an Eldrazi Spawn, create three 0/1 colorless Eldrazi Spawn creature tokens. They have "Sacrifice this token: Add {C}." Otherwise, create one of those tokens.',
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { subtype: "Eldrazi", subtypes: ["Spawn"] }, atLeast: 1 },
    then: { kind: "create-token", token: "Eldrazi Spawn Token", count: 3 },
    else: { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
  },
});
