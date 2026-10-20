import { defineCard } from "../define.js";

// EDHREC rank 14778.

export default defineCard({
  name: "Ogre-Head Helm",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Ogre"],
  power: 2,
  toughness: 2,
  text: "Equipped creature gets +2/+2.\nWhenever this creature or equipped creature deals combat damage to a player, you may sacrifice it. If you do, discard your hand, then draw three cards.\nReconfigure {3} ({3}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
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
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Equipped creature gets +2/+2." }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Sacrifice it to discard your hand and draw three cards?", effect: { kind: "sequence", effects: [{ kind: "sacrifice-target", target: "trigger-object" }, { kind: "conditional", condition: { kind: "this-way", what: "sacrificed", atLeast: 1 }, then: { kind: "sequence", effects: [{ kind: "discard-hand", who: "you" }, { kind: "draw", amount: 3 }] } }] } },
      resolve: null,
      text: "Whenever this creature or equipped creature deals combat damage to a player, you may sacrifice it. If you do, discard your hand, then draw three cards.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "may", prompt: "Sacrifice it to discard your hand and draw three cards?", effect: { kind: "sequence", effects: [{ kind: "sacrifice-target", target: "trigger-object" }, { kind: "conditional", condition: { kind: "this-way", what: "sacrificed", atLeast: 1 }, then: { kind: "sequence", effects: [{ kind: "discard-hand", who: "you" }, { kind: "draw", amount: 3 }] } }] } },
      resolve: null,
      text: "Whenever this creature or equipped creature deals combat damage to a player, you may sacrifice it. If you do, discard your hand, then draw three cards.",
    },
  ],
});
