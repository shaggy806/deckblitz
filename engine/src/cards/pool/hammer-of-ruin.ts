import { defineCard } from "../define.js";

// EDHREC rank 24183.

const TRIGGER_TEXT =
  "Whenever equipped creature deals combat damage to a player, you may destroy target Equipment that player controls.";

export default defineCard({
  name: "Hammer of Ruin",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +2/+0.\n${TRIGGER_TEXT}\nEquip {2}`,
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
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { subtype: "Equipment" } }],
      effect: {
        kind: "may",
        prompt: "Destroy that Equipment?",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
});
