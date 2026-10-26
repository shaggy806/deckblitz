import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 15030.

export default defineCard({
  name: "Daybreak Ranger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Archer", "Ranger", "Werewolf"],
  power: 2,
  toughness: 2,
  text: "{T}: This creature deals 2 damage to target creature with flying.\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 2 damage to target creature with flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", none: true },
    },
  ],
  faces: ["Daybreak Ranger", "Nightfall Predator"],
  transform: true,
});
