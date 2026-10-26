import { defineCard } from "../define.js";

const LORD_TEXT = "Each other creature you control that's a Werewolf or a Wolf gets +1/+1.";

// A creature that's both a Werewolf and a Wolf gets +1/+1 once (the ruling):
// one static over "Werewolf or Wolf".
export default defineCard({
  name: "Howlpack Alpha",
  art: "https://cards.scryfall.io/art_crop/back/e/f/ef84540b-a132-4169-b3c0-b0edeb395c9b.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 3,
  text: `${LORD_TEXT}\nAt the beginning of your end step, create a 2/2 green Wolf creature token.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", subtypes: ["Werewolf", "Wolf"] },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: "At the beginning of your end step, create a 2/2 green Wolf creature token.",
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
  faces: ["Mayor of Avabruck", "Howlpack Alpha"],
  transform: true,
});
