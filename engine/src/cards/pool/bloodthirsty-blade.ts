import { defineCard } from "../define.js";

// You still control the Blade on an opponent's creature, and only you can move
// it (the ruling). It has no equip ability.
const STATIC_TEXT =
  "Equipped creature gets +2/+0 and is goaded. (It attacks each combat if able and attacks a player other than you if able.)";
const ATTACH_TEXT = "{1}: Attach this Equipment to target creature an opponent controls. Activate only as a sorcery.";

export default defineCard({
  name: "Bloodthirsty Blade",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${ATTACH_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      goads: true,
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "attach", target: 0 },
      sorcerySpeed: true,
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
});
