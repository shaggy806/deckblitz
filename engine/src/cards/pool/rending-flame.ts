import { defineCard } from "../define.js";

// Whether the permanent is a Spirit is read as the spell resolves, after the
// 5 damage (state-based actions haven't removed it yet, rule 704.3).
export default defineCard({
  name: "Rending Flame",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Rending Flame deals 5 damage to target creature or planeswalker. If that permanent is a Spirit, Rending Flame also deals 2 damage to that permanent's controller.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Spirit" } },
        then: { kind: "damage", amount: 2, toControllerOfTarget: 0 },
      },
    ],
  },
});
