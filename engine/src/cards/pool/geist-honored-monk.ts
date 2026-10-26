import { defineCard } from "../define.js";

// EDHREC rank 8678. Burrowguard Mentor's characteristic-defining ability
// (rule 604.3), counting itself.
//
// Rulings:
//   As long as Geist-Honored Monk is on the battlefield, its second ability will count itself.
//   The ability that defines Geist-Honored Monk's power and toughness works in all zones, not
//     just the battlefield.

const PT_TEXT = "Geist-Honored Monk's power and toughness are each equal to the number of creatures you control.";
const ETB = "When this creature enters, create two 1/1 white Spirit creature tokens with flying.";

export default defineCard({
  name: "Geist-Honored Monk",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 0,
  toughness: 0,
  keywords: ["vigilance"],
  text: `Vigilance\n${PT_TEXT}\n${ETB}`,
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
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 2 },
      resolve: null,
      text: ETB,
    },
  ],
});
