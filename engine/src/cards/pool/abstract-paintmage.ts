import { defineCard } from "../define.js";

// EDHREC rank 9483.

const MANA_TEXT =
  "At the beginning of your first main phase, add {U}{R}. Spend this mana only to cast instant and sorcery spells.";

// A triggered ability, not a mana ability (it has no activation and isn't a
// tapped-for-mana trigger — rule 605.1), so it uses the stack. The mana is
// one {U} and one {R} (`all`), each unit restricted.
export default defineCard({
  name: "Abstract Paintmage",
  manaCost: "{U}{U/R}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Djinn", "Sorcerer"],
  power: 2,
  toughness: 2,
  text: MANA_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { all: ["U", "R"] },
        amount: 1,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast instant and sorcery spells.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
