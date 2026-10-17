import { defineCard } from "../define.js";

const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control. Untap that creature.";

// Rulings: the trigger attaches it (no equip cost or timing); with its target
// gone illegal the Bow stays unattached and nothing is untapped.
export default defineCard({
  name: "Galadhrim Bow",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text:
    `Flash\n${ENTER_TEXT}\nEquipped creature gets +1/+2 and has reach.\n` +
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
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 2],
      grantKeywords: ["reach"],
      text: "Equipped creature gets +1/+2 and has reach.",
    },
  ],
});
