import { defineCard } from "../define.js";

// EDHREC rank 12559.

export default defineCard({
  name: "Simian Sling",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Monkey"],
  power: 1,
  toughness: 1,
  text: "Equipped creature gets +1/+1.\nWhenever this creature or equipped creature becomes blocked, it deals 1 damage to defending player.\nReconfigure {2} ({2}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Reconfigure {2}",
      sorcerySpeed: true,
      reconfigure: "attach",
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      effect: { kind: "unattach", target: "source" },
      resolve: null,
      text: "Reconfigure {2}",
      sorcerySpeed: true,
      reconfigure: "unattach",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player", from: "trigger-object" },
      resolve: null,
      text: "Whenever this creature or equipped creature becomes blocked, it deals 1 damage to defending player.",
    },
    {
      trigger: { on: "becomes-blocked", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player", from: "trigger-object" },
      resolve: null,
      text: "Whenever this creature or equipped creature becomes blocked, it deals 1 damage to defending player.",
    },
  ],
});
