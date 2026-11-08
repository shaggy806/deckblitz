import { defineCard } from "../define.js";

const PT_TEXT = "Serpent of the Endless Sea's power and toughness are each equal to the number of Islands you control.";
const ATTACK_TEXT = "This creature can't attack unless defending player controls an Island.";

export default defineCard({
  name: "Serpent of the Endless Sea",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Island", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { subtype: "Island" } } }],
      text: ATTACK_TEXT,
    },
  ],
});
