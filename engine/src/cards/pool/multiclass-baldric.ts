import { defineCard } from "../define.js";

export default defineCard({
  name: "Multiclass Baldric",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature has lifelink if you control a Cleric, deathtouch if you control a Rogue, haste if you control a Warrior, and flying if you control a Wizard.\nAs long as you have a full party, prevent all damage that would be dealt to equipped creature.\nEquip {2}",
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "controls", filter: { subtype: "Cleric" }, atLeast: 1 },
      grantKeywords: ["lifelink"],
      text: "Equipped creature has lifelink if you control a Cleric.",
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "controls", filter: { subtype: "Rogue" }, atLeast: 1 },
      grantKeywords: ["deathtouch"],
      text: "Equipped creature has deathtouch if you control a Rogue.",
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "controls", filter: { subtype: "Warrior" }, atLeast: 1 },
      grantKeywords: ["haste"],
      text: "Equipped creature has haste if you control a Warrior.",
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 1 },
      grantKeywords: ["flying"],
      text: "Equipped creature has flying if you control a Wizard.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "full-party" },
      replacement: { event: "would-deal-damage", to: "attached", prevent: true },
      text: "As long as you have a full party, prevent all damage that would be dealt to equipped creature.",
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
