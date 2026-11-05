import { defineCard } from "../define.js";

// EDHREC rank 13109.

export default defineCard({
  name: "Selfless Glyphweaver",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: "Exile this creature: Creatures you control gain indestructible until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, exileSelf: true },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Exile this creature: Creatures you control gain indestructible until end of turn.",
    },
  ],
  faces: ["Selfless Glyphweaver", "Deadly Vanity"],
});
