import { defineCard } from "../define.js";

export default defineCard({
  name: "Shieldmage Elder",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Wizard"],
  power: 2,
  toughness: 3,
  text: "Tap two untapped Clerics you control: Prevent all damage target creature would deal this turn.\nTap two untapped Wizards you control: Prevent all damage target spell would deal this turn.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { subtype: "Cleric", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["creature"],
      effect: { kind: "damage-rule", by: { target: 0 } },
      resolve: null,
      text: "Tap two untapped Clerics you control: Prevent all damage target creature would deal this turn.",
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { subtype: "Wizard", controlledBy: "you" }, includeSelf: true },
      },
      // A permanent spell's prevention goes on to the permanent it becomes
      // (rule 400.7c): the damage rule's spell source covers it.
      targets: ["spell"],
      effect: { kind: "damage-rule", by: { target: 0 } },
      resolve: null,
      text: "Tap two untapped Wizards you control: Prevent all damage target spell would deal this turn.",
    },
  ],
});
