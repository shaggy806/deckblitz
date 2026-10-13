import { defineCard } from "../define.js";
import { mobilize } from "../helpers.js";

// EDHREC rank 10077.
// Makes Warrior → "Red Warrior Token" (via the mobilize helper).
//
// Its power is a characteristic-defining ability (rule 604.3), Adeline's
// shape: it counts itself, and the Warrior tokens mobilize makes.

const POWER_TEXT = "Zurgo's Vanguard's power is equal to the number of creatures you control.";

export default defineCard({
  name: "Zurgo's Vanguard",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog", "Soldier"],
  power: 0,
  toughness: 3,
  text: `Mobilize 1 (Whenever this creature attacks, create a tapped and attacking 1/1 red Warrior creature token. Sacrifice it at the beginning of the next end step.)\n${POWER_TEXT}`,
  triggered: [mobilize(1)],
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
