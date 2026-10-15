import { defineCard } from "../define.js";

// EDHREC rank 16516.
//
// Rulings:
//   [2025-11-17] Wither applies to any damage dealt to creatures by the affected creature. This
//     includes combat damage as well as anything that causes that creature to deal noncombat
//     damage, such as the effect of Assert Perfection.
//
// Stolen Stark Tech's shape: the attach and the wither are separate steps, so
// the creature still gains wither if the Equipment has left by the time the
// trigger resolves.
const ENTER_TEXT =
  "When this Equipment enters, attach it to target creature you control. That creature gains wither until end of turn.";

export default defineCard({
  name: "Barbed Bloodletter",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT} (It deals damage to creatures in the form of -1/-1 counters.)\nEquipped creature gets +1/+2.\nEquip {2}`,
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
          { kind: "grant-keyword", target: 0, keyword: "wither", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: "Equipped creature gets +1/+2." }],
});
