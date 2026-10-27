import { defineCard } from "../define.js";

export default defineCard({
  name: "Shield of Kaldra",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipment named Sword of Kaldra, Shield of Kaldra, and Helm of Kaldra have indestructible.\nEquipped creature has indestructible. (Damage and effects that say \"destroy\" don't destroy it.)\nEquip {4}",
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {4}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: {
          subtype: "Equipment",
          anyOf: [{ name: "Sword of Kaldra" }, { name: "Shield of Kaldra" }, { name: "Helm of Kaldra" }],
        },
      },
      grantKeywords: ["indestructible"],
      text: "Equipment named Sword of Kaldra, Shield of Kaldra, and Helm of Kaldra have indestructible.",
    },
    {
      affects: { scope: "attached" },
      grantKeywords: ["indestructible"],
      text: "Equipped creature has indestructible.",
    },
  ],
});
