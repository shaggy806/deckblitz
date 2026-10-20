import { defineCard } from "../define.js";

export default defineCard({
  name: "Neonate's Rush",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if you control a Vampire.\nNeonate's Rush deals 1 damage to target creature and 1 damage to its controller. Draw a card.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Vampire" }, atLeast: 1 },
    reduceGeneric: 1,
  },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      // Shocker, Unshakable's shape: both damages are one event.
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "damage", amount: 1, toControllerOfTarget: 0 },
        ],
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
