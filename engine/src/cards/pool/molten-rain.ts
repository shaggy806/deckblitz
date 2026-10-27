import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 16184.
//
// Choking Sands' shape: whether the land is nonbasic is read as the spell
// resolves, and the damage goes to its controller whether or not the destroy
// worked (the ruling: an indestructible land's controller is still dealt 2).

export default defineCard({
  name: "Molten Rain",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land. If that land was nonbasic, Molten Rain deals 2 damage to the land's controller.",
  targets: ["land"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { notSupertype: "basic" } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "damage", amount: 2, toControllerOfTarget: 0 },
      ],
    },
    else: { kind: "destroy", target: 0 },
  },
});
