import { defineCard } from "../define.js";

// EDHREC rank 21875.

export default defineCard({
  name: "Chainflail Centipede",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Insect"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature or equipped creature attacks, it gets +2/+0 until end of turn.\nReconfigure {2} ({2}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
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
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature or equipped creature attacks, it gets +2/+0 until end of turn.",
    },
    {
      trigger: { on: "attacks", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature or equipped creature attacks, it gets +2/+0 until end of turn.",
    },
  ],
});
