import { defineCard } from "../define.js";

const ENTERS = "When this Equipment enters, attach it to target creature you control.";

// Equip—Sacrifice an artifact: Demonmail Hauberk's shape with an artifact. It
// may sacrifice itself, and then attaches nothing (the ruling).
export default defineCard({
  name: "Piston Sledge",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\nEquipped creature gets +3/+1.\nEquip—Sacrifice an artifact.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 1], text: "Equipped creature gets +3/+1." }],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip—Sacrifice an artifact.",
      sorcerySpeed: true,
    },
  ],
});
