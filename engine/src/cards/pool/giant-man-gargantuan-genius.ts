import { defineCard } from "../define.js";

// EDHREC rank 19885.
// "Your first main phase" is the precombat main phase (Black Market's
// trigger). The creatures are counted as the ability resolves, Giant-Man
// himself among them.

const MANA_TEXT =
  "At the beginning of your first main phase, add {G} for each creature you control with power 4 or greater.";

export default defineCard({
  name: "Giant-Man, Gargantuan Genius",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Hero"],
  power: 6,
  toughness: 6,
  keywords: ["reach"],
  text: `Reach\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "G",
        amount: { countOf: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } } },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
