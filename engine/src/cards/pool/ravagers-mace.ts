import { defineCard } from "../define.js";

// Party (rule 700.8): the bonus is counted continuously, from the Mace's
// controller's creatures.
export default defineCard({
  name: "Ravager's Mace",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "When this Equipment enters, attach it to target creature you control.\nEquipped creature gets +1/+0 for each creature in your party and has menace. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)\nEquip {2}{B}{R}",
  activated: [
    {
      cost: { mana: "{2}{B}{R}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}{B}{R}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: "When this Equipment enters, attach it to target creature you control.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { partySize: true, pt: [1, 0] },
      grantKeywords: ["menace"],
      text: "Equipped creature gets +1/+0 for each creature in your party and has menace.",
    },
  ],
});
