import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 27556.
//
// Each half asks, as the spell resolves, whether any mana of its colour was
// spent on the whole cost (the rulings; a copy had none spent). The creature
// spell is an optional target chosen on cast either way: targeted and
// illegal on resolution, the whole spell does nothing (rule 608.2b).

export default defineCard({
  name: "Repel Intruders",
  manaCost: "{3}{W/U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Create two 1/1 white Kithkin Soldier creature tokens if {W} was spent to cast this spell. Counter up to one target creature spell if {U} was spent to cast this spell. (Do both if {W}{U} was spent.)",
  targets: [{ kind: "optional", of: "creature-spell" }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { W: 1 } } },
        then: { kind: "create-token", token: "Kithkin Soldier Token", count: 2 },
      },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { U: 1 } } },
        then: { kind: "counter", target: 0 },
      },
    ],
  },
});
