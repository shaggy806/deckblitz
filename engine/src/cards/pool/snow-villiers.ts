import { defineCard } from "../define.js";

// EDHREC rank 15537.
//
// Adeline, Resplendent Cathar's power-only characteristic-defining ability,
// which works in every zone (the ruling), over a printed toughness of 3.
//
// Rulings:
//   [2025-06-06] The ability that defines Snow Villiers's power applies in all zones, not just the
//     battlefield. As long as Snow Villiers is on the battlefield (and still a creature), that
//     ability will count Snow Villiers itself.

const POWER_TEXT = "Snow Villiers's power is equal to the number of creatures you control.";

export default defineCard({
  name: "Snow Villiers",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Monk"],
  power: 0,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${POWER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
});
