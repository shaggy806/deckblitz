import { defineCard } from "../define.js";


export default defineCard({
  name: "Krallenhorde Howler",
  art: "https://cards.scryfall.io/art_crop/back/4/e/4ef68479-ab2e-4a60-886c-ad007b64f185.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 3,
  text: "Creature spells you cast cost {1} less to cast.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature" }, caster: "you", reduceGeneric: 1 },
      text: "Creature spells you cast cost {1} less to cast.",
    },
  ],
  faces: ["Duskwatch Recruiter", "Krallenhorde Howler"],
  transform: true,
});
