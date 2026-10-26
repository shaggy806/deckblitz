import { defineCard } from "../define.js";

// EDHREC rank 29299.

const TEXT =
  "Domain — Matca Rioters's power and toughness are each equal to the number of basic land types among lands you control.";

export default defineCard({
  name: "Matca Rioters",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { basicLandTypes: "you" }, plusPower: 0, plusToughness: 0 },
      text: TEXT,
    },
  ],
});
