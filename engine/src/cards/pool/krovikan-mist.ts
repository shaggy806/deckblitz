import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 16242.
//
// "Illusions on the battlefield" is every player's Illusions, this one
// included (rule 604.3 — a characteristic-defining ability).

const PT = "Krovikan Mist's power and toughness are each equal to the number of Illusions on the battlefield.";

export default defineCard({
  name: "Krovikan Mist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${PT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { subtype: "Illusion" } }, plusPower: 0, plusToughness: 0 },
      text: PT,
    },
  ],
});
