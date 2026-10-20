import { defineCard } from "../define.js";

// EDHREC rank 19996.
//
// The enters attach isn't an equip: no sorcery timing, no mana (the ruling).

const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control.";

export default defineCard({
  name: "Scavenged Blade",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\nEquipped creature gets +2/+0.\nEquip {2}{R}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}{R}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
});
