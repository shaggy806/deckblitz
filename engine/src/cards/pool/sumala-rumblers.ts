import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

// EDHREC rank 19048.
//
// Adeline's power CDA (rule 604.3, every zone — the ruling) over a printed
// toughness of 4, and myriad as the `myriad()` helper writes it.

const POWER_TEXT = "Sumala Rumblers's power is equal to the number of creatures you control.";
const MYRIAD_TEXT =
  "Myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)";

export default defineCard({
  name: "Sumala Rumblers",
  manaCost: "{2}{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 0,
  toughness: 4,
  text: `${POWER_TEXT}\n${MYRIAD_TEXT}`,
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
  triggered: [myriad()],
});
