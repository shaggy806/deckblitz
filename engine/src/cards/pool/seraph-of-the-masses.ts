import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 14580.
//
// A characteristic-defining ability (rule 604.3) that counts itself on the
// battlefield and works in every zone (the rulings) — Burrowguard Mentor's
// shape.

const PT_TEXT = "Seraph of the Masses's power and toughness are each equal to the number of creatures you control.";

export default defineCard({
  name: "Seraph of the Masses",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying\n${PT_TEXT}`,
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
});
