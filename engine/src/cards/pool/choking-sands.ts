import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 24718.
//
// Icequake's shape: whether the land is nonbasic is read as the spell
// resolves, and the damage goes to whoever controlled it (last-known
// information, rule 608.2h).

export default defineCard({
  name: "Choking Sands",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target non-Swamp land. If that land was nonbasic, Choking Sands deals 2 damage to the land's controller.",
  targets: [{ kind: "permanent", filter: { type: "land", notSubtypes: ["Swamp"] } }],
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
