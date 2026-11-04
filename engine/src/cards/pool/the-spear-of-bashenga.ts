import { defineCard } from "../define.js";

export default defineCard({
  name: "The Spear of Bashenga",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["artifact"],
  supertypes: ["legendary"],
  subtypes: ["Equipment"],
  text: "When The Spear of Bashenga enters, if there is no monarch, you become the monarch.\nEquipped creature gets +2/+2 and has vigilance.\nWhenever equipped creature attacks the monarch, destroy target tapped nonland permanent that player controls.\nEquip {2}",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["vigilance"],
      text: "Equipped creature gets +2/+2 and has vigilance.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "monarch", who: "nobody" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: "When The Spear of Bashenga enters, if there is no monarch, you become the monarch.",
    },
    {
      trigger: { on: "attacks", who: "attached", attackedMonarch: true },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { tapped: true, notTypes: ["land"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "Whenever equipped creature attacks the monarch, destroy target tapped nonland permanent that player controls.",
    },
  ],
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
});
