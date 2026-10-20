import { defineCard } from "../define.js";

// EDHREC rank 10973.

export default defineCard({
  name: "Acquisition Octopus",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Octopus"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature or equipped creature deals combat damage to a player, draw a card.\nReconfigure {2} ({2}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
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
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature or equipped creature deals combat damage to a player, draw a card.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature or equipped creature deals combat damage to a player, draw a card.",
    },
  ],
});
