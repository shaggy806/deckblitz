import { defineCard } from "../define.js";

export default defineCard({
  name: "Dwarven Castle Guard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Soldier"],
  power: 2,
  toughness: 1,
  text: "When this creature dies, create a 1/1 colorless Hero creature token.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: 1 },
      resolve: null,
      text: "When this creature dies, create a 1/1 colorless Hero creature token.",
    },
  ],
});
