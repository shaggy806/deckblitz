import { defineCard } from "../define.js";

export default defineCard({
  name: "Fallaji Excavation",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create three tapped Powerstone tokens. You gain 3 life. (The tokens are artifacts with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Powerstone Token", count: 3, tapped: true },
      { kind: "gain-life", amount: 3 },
    ],
  },
});
