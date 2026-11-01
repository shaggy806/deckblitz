import { defineCard } from "../define.js";

// EDHREC rank 1626. "Attached to it" is the equipped creature, so an Aura on
// the creature counts, and this Equipment itself.
export default defineCard({
  name: "Thran Power Suit",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+1 for each Aura and Equipment attached to it and has ward {2}. (Whenever equipped creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: {
        filter: { subtypes: ["Aura", "Equipment"], attachedTo: { isSource: true } },
        relativeToAffected: true,
        pt: [1, 1],
      },
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
          targets: [],
          effect: { kind: "ward", cost: { mana: "{2}" } },
          resolve: null,
          text: "Ward {2}",
        },
      ],
      text: "Equipped creature gets +1/+1 for each Aura and Equipment attached to it and has ward {2}.",
    },
  ],
});
