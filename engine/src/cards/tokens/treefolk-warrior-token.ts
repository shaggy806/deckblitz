import { defineCard } from "../define.js";

const PT_TEXT = "This token's power and toughness are each equal to the number of Forests you control.";

export default defineCard({
  name: "Treefolk Warrior Token",
  art: "2569593a-d2f2-414c-9e61-2c34e8a5832d",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Warrior"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Forest", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
