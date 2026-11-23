import { defineCard } from "../define.js";

// The Covert Blue Mage's token: no token printing in the Oracle snapshot.

export default defineCard({
  name: "Covert Sunglasses",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature can't be blocked.\nEquip {2}{W/U}",
  static: [{ affects: { scope: "attached" }, grantKeywords: ["unblockable"], text: "Equipped creature can't be blocked." }],
  activated: [
    {
      cost: { mana: "{2}{W/U}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}{W/U}",
      sorcerySpeed: true,
    },
  ],
});
