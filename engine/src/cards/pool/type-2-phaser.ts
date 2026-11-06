import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const ENTER =
  "When this Equipment enters, tap target creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Type-2 Phaser",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER}\nEquipped creature gets +3/+0.\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 0], text: "Equipped creature gets +3/+0." }],
  activated: [equip("{3}")],
});
