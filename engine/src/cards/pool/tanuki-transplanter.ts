import { defineCard } from "../define.js";

// EDHREC rank 6570.

export default defineCard({
  name: "Tanuki Transplanter",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Dog"],
  power: 2,
  toughness: 4,
  text: "Whenever this creature or equipped creature attacks, add an amount of {G} equal to its power. Until end of turn, you don't lose this mana as steps and phases end.\nReconfigure {3} ({3}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Reconfigure {3}",
      sorcerySpeed: true,
      reconfigure: "attach",
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      effect: { kind: "unattach", target: "source" },
      resolve: null,
      text: "Reconfigure {3}",
      sorcerySpeed: true,
      reconfigure: "unattach",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: { powerOf: "trigger-object" }, persists: true },
      resolve: null,
      text: "Whenever this creature or equipped creature attacks, add an amount of {G} equal to its power. Until end of turn, you don't lose this mana as steps and phases end.",
    },
    {
      trigger: { on: "attacks", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: { powerOf: "trigger-object" }, persists: true },
      resolve: null,
      text: "Whenever this creature or equipped creature attacks, add an amount of {G} equal to its power. Until end of turn, you don't lose this mana as steps and phases end.",
    },
  ],
});
