import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 22984. Admiral's Order's conditional
// alternative cost: any life gained by one opponent this turn opens the {B},
// whatever they lost besides (the ruling).

export default defineCard({
  name: "Needlebite Trap",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If an opponent gained life this turn, you may pay {B} rather than pay this spell's mana cost.\nTarget player loses 5 life and you gain 5 life.",
  alternativeCost: {
    mana: "{B}",
    condition: { kind: "turn-stat", stat: "life-gained", who: "opponent", atLeast: 1 },
  },
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: 5, target: 0 },
      { kind: "gain-life", amount: 5 },
    ],
  },
});
