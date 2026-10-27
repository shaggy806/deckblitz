import { defineCard } from "../define.js";

const PT_TEXT = "Heedless One's power and toughness are each equal to the number of Elves on the battlefield.";

export default defineCard({
  name: "Heedless One",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Avatar"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { subtype: "Elf" } }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
});
