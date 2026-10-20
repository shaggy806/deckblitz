import { defineCard } from "../define.js";

// EDHREC rank 3626.

export default defineCard({
  name: "Komainu Battle Armor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Dog"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: "Menace\nEquipped creature gets +2/+2 and has menace.\nWhenever this creature or equipped creature deals combat damage to a player, goad each creature that player controls.\nReconfigure {4} ({4}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Reconfigure {4}",
      sorcerySpeed: true,
      reconfigure: "attach",
    },
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      effect: { kind: "unattach", target: "source" },
      resolve: null,
      text: "Reconfigure {4}",
      sorcerySpeed: true,
      reconfigure: "unattach",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["menace"],
      text: "Equipped creature gets +2/+2 and has menace.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "goad", who: "trigger-player" },
      resolve: null,
      text: "Whenever this creature or equipped creature deals combat damage to a player, goad each creature that player controls.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "goad", who: "trigger-player" },
      resolve: null,
      text: "Whenever this creature or equipped creature deals combat damage to a player, goad each creature that player controls.",
    },
  ],
});
