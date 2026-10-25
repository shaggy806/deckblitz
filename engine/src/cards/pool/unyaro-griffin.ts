import { defineCard } from "../define.js";

// EDHREC rank 24591. Cursecatcher's sacrifice, a plain counter narrowed to red.

const TEXT = "Sacrifice this creature: Counter target red instant or sorcery spell.";

export default defineCard({
  name: "Unyaro Griffin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "spell", filter: { typesAnyOf: ["instant", "sorcery"], colors: ["R"] } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
