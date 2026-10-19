import { defineCard } from "../define.js";

// Domain (an ability word, rule 207.2c): a characteristic-defining ability
// (rule 604.3) counting the basic land types among lands you control — not
// lands, and not a Desert (the rulings). Its toughness is the printed 3.

const PT_TEXT = "Domain — Nishoba Brawler's power is equal to the number of basic land types among lands you control.";

export default defineCard({
  name: "Nishoba Brawler",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 0,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { basicLandTypes: "you" }, plusPower: 0, plusToughness: 0, only: "power" },
      text: PT_TEXT,
    },
  ],
});
