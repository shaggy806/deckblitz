import { defineCard } from "../define.js";


const BLOCK_TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, this creature deals 2 damage to that creature.";

export default defineCard({
  name: "Flameheart Werewolf",
  art: "https://cards.scryfall.io/art_crop/back/3/3/33e542ce-1106-489d-9563-bd62886b8ed3.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 2,
  text: "Whenever this creature blocks or becomes blocked by a creature, this creature deals 2 damage to that creature.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "damage", amount: 2, target: "trigger-object" },
      resolve: null,
      text: BLOCK_TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "damage", amount: 2, target: "trigger-object" },
      resolve: null,
      text: BLOCK_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  faces: ["Kessig Forgemaster", "Flameheart Werewolf"],
  transform: true,
});
