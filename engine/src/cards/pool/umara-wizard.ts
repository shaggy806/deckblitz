import { defineCard } from "../define.js";

// Modal double-faced card (rule 712) — the back face is Umara Skyfalls.
// Rulings:
//   A Wizard spell is one with the creature type Wizard.

const TEXT = "Whenever you cast an instant, sorcery, or Wizard spell, this creature gains flying until end of turn.";

export default defineCard({
  name: "Umara Wizard",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { subtype: "Wizard" }] },
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Umara Wizard", "Umara Skyfalls"],
});
