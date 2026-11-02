import { defineCard } from "../define.js";

const PT_TEXT = "Queen Allenal of Ruadach's power and toughness are each equal to the number of creatures you control.";
const TOKEN_TEXT =
  "If one or more creature tokens would be created under your control, those tokens plus a 1/1 white Soldier creature token are created instead.";

export default defineCard({
  name: "Queen Allenal of Ruadach",
  manaCost: "{G}{W}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Elf", "Noble"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-create-token",
        plusOneToken: "Soldier Token",
        ofTokens: { type: "creature" },
      },
      text: TOKEN_TEXT,
    },
  ],
});
