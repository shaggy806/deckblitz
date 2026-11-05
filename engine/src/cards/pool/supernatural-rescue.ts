import { defineCard } from "../define.js";

// EDHREC rank 25051.
//
// The conditional flash is `flashIf` (Crashing Tide). The cast trigger's two
// targets are chosen as it goes on the stack (Elder Deep-Fiend), whether or
// not the Aura resolves.
const CAST_TEXT = "When you cast this spell, tap up to two target creatures you don't control.";

export default defineCard({
  name: "Supernatural Rescue",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  flashIf: { condition: { kind: "controls", filter: { subtype: "Spirit" }, atLeast: 1 } },
  text: `This spell has flash as long as you control a Spirit.\n${CAST_TEXT}\nEnchant creature you control\nEnchanted creature gets +1/+2.`,
  targets: ["creature-you-control"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 2],
      text: "Enchanted creature gets +1/+2.",
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [
        { kind: "optional", of: "creature-an-opponent-controls" },
        { kind: "optional", of: { kind: "other", of: "creature-an-opponent-controls", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
