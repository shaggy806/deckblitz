import { defineCard } from "../define.js";

const PT_TEXT = "Winnowing Forces's power and toughness are each equal to the number of lands you control.";

export default defineCard({
  name: "Winnowing Forces",
  art: "https://cards.scryfall.io/art_crop/back/9/3/93f623da-616e-4067-9ea8-5dfbeef8ce0b.jpg",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "land", controlledBy: "you" } }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
  faces: ["Invasion of Lorwyn", "Winnowing Forces"],
  transform: true,
});
