import { defineCard } from "../define.js";

export default defineCard({
  name: "Kuon, Ogre Ascendant",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ogre", "Monk"],
  power: 2,
  toughness: 4,
  text: "At the beginning of the end step, if three or more creatures died this turn, flip Kuon.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "died", who: "any-player", filter: { type: "creature" }, atLeast: 3 },
      targets: [],
      effect: { kind: "flip", target: "source" },
      resolve: null,
      text: "At the beginning of the end step, if three or more creatures died this turn, flip Kuon.",
    },
  ],
  faces: ["Kuon, Ogre Ascendant", "Kuon's Essence"],
  flip: true,
});
