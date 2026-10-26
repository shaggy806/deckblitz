import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.

export default defineCard({
  name: "Nightfall Predator",
  art: "https://cards.scryfall.io/art_crop/back/2/5/25b54a1d-e201-453b-9173-b04e06ee6fb7.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 4,
  text: "{R}, {T}: This creature fights target creature. (Each deals damage equal to its power to the other.)\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "fight", a: "source", b: 0 },
      resolve: null,
      text: "{R}, {T}: This creature fights target creature.",
    },
  ],
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
  faces: ["Daybreak Ranger", "Nightfall Predator"],
  transform: true,
});
