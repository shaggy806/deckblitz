import { defineCard } from "../define.js";

export default defineCard({
  name: "Blight Sickle",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+0 and has wither. (It deals damage to creatures in the form of -1/-1 counters.)\nEquip {2}",
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
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["wither"],
      text: "Equipped creature gets +1/+0 and has wither.",
    },
  ],
});
