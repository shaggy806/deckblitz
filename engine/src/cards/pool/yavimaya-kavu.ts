import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 28822. Two one-sided CDAs (Dauthi Warlord's
// power, An-Havva Constable's toughness); each counts itself while it's on
// the battlefield, being red and green.

const POWER = "Yavimaya Kavu's power is equal to the number of red creatures on the battlefield.";
const TOUGHNESS = "Yavimaya Kavu's toughness is equal to the number of green creatures on the battlefield.";

export default defineCard({
  name: "Yavimaya Kavu",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 0,
  toughness: 0,
  text: `${POWER}\n${TOUGHNESS}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", colors: ["R"] } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER,
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", colors: ["G"] } },
        plusPower: 0,
        plusToughness: 0,
        only: "toughness",
      },
      text: TOUGHNESS,
    },
  ],
});
