import { defineCard } from "../define.js";

// EDHREC rank 24614. Secrets of Strixhaven.
//
// Repartee asks only what the spell targeted as it was cast (the rulings), and
// resolves before the spell, even one that's countered.
const REPARTEE_TEXT =
  "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Rehearsed Debater",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Djinn", "Bard"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${REPARTEE_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { type: "creature" } } },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: REPARTEE_TEXT,
    },
  ],
});
