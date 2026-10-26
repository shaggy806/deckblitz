import { defineCard } from "../define.js";

// EDHREC rank 17944.

const TEXT = "Beast of Burden's power and toughness are each equal to the number of creatures on the battlefield.";

export default defineCard({
  name: "Beast of Burden",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      // A characteristic-defining ability (rule 604.3) counting every
      // creature on the battlefield, itself included (Altar Golem's shape).
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { type: "creature" } }, plusPower: 0, plusToughness: 0 },
      text: TEXT,
    },
  ],
});
