import { defineCard } from "../define.js";

// Domain (an ability word, rule 207.2c): a characteristic-defining ability
// (rule 604.3) counting the basic land types among lands you control, twice
// over — the count added to itself (`sum`).

const PT_TEXT =
  "Domain — Territorial Maro's power and toughness are each equal to twice the number of basic land types among lands you control.";

export default defineCard({
  name: "Territorial Maro",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: PT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { sum: [{ basicLandTypes: "you" }, { basicLandTypes: "you" }] },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
