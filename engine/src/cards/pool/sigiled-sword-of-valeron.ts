import { defineCard } from "../define.js";

// The Knight enters attacking a player or planeswalker of its controller's
// choice (`attacking: "choose"` — the second ruling), never declared, so
// attack triggers don't see it (the first).
const STATIC_TEXT = "Equipped creature gets +2/+0, has vigilance, and is a Knight in addition to its other types.";
const ATTACK_TEXT =
  "Whenever equipped creature attacks, create a 2/2 white Knight creature token with vigilance that's attacking.";

export default defineCard({
  name: "Sigiled Sword of Valeron",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${ATTACK_TEXT}\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantKeywords: ["vigilance"],
      addSubtypes: ["Knight"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token", count: 1, attacking: "choose" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
});
