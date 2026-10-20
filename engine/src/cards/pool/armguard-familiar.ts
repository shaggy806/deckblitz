import { defineCard } from "../define.js";

// EDHREC rank 16317.

export default defineCard({
  name: "Armguard Familiar",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Beast"],
  power: 2,
  toughness: 1,
  text: "Ward {2} (Whenever this permanent becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\nEquipped creature gets +2/+1 and has ward {2}.\nReconfigure {4} ({4}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)",
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
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 1],
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
          targets: [],
          effect: { kind: "ward", cost: { mana: "{2}" } },
          resolve: null,
          text: "Ward {2}",
        },
      ],
      text: "Equipped creature gets +2/+1 and has ward {2}.",
    },
  ],
});
