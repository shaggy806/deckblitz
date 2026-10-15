import { defineCard } from "../define.js";

// EDHREC rank 18292.
//
// The attach and the untap are separate steps: the creature is untapped even
// if the Equipment has left by the time the trigger resolves.
const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control. Untap that creature.";

export default defineCard({
  name: "Super Suit",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text:
    `Flash\n${ENTER_TEXT}\nEquipped creature gets +1/+2.\n` +
    "Equip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
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
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "attach", target: 0, attachment: "source" },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: "Equipped creature gets +1/+2." }],
});
