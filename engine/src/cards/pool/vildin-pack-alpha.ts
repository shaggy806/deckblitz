import { defineCard } from "../define.js";


export default defineCard({
  name: "Vildin-Pack Alpha",
  art: "https://cards.scryfall.io/art_crop/back/f/0/f0af234d-ce14-49ac-b877-00b0dd1f11e2.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 3,
  text: "Whenever a Werewolf you control enters, you may transform it.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Werewolf" } },
      targets: [],
      effect: { kind: "may", prompt: "Transform it?", effect: { kind: "transform", target: "trigger-object" } },
      resolve: null,
      text: "Whenever a Werewolf you control enters, you may transform it.",
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
  faces: ["Geier Reach Bandit", "Vildin-Pack Alpha"],
  transform: true,
});
