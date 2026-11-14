import { defineCard } from "../define.js";

// EDHREC rank 24605.
//
// - "As this creature enters, pay any amount of life" is Phyrexian
//   Processor's: chosen and paid as it enters (rule 614.12), and kept as its
//   chosen number. Countered, it never asks (the ruling).
// - Its power and toughness are that number (Shapeshifter's
//   `"chosen-number"` count): 0 anywhere but the battlefield.

const PAY_TEXT = "As this creature enters, pay any amount of life.";
const PT_TEXT = "Minion of the Wastes's power and toughness are each equal to the life paid as it entered.";

export default defineCard({
  name: "Minion of the Wastes",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Minion"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${PAY_TEXT}\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", asEnters: { payLife: "any" } },
      text: PAY_TEXT,
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "chosen-number", plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
});
