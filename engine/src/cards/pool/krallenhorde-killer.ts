import { defineCard } from "../define.js";

export default defineCard({
  name: "Krallenhorde Killer",
  art: "https://cards.scryfall.io/art_crop/back/1/3/1303e02a-ef69-4817-bca5-02c74774b811.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 2,
  toughness: 2,
  text: "{3}{G}: This creature gets +4/+4 until end of turn. Activate only once each turn.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 4, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      text: "{3}{G}: This creature gets +4/+4 until end of turn. Activate only once each turn.",
      oncePerTurn: true,
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
  faces: ["Wolfbitten Captive", "Krallenhorde Killer"],
  transform: true,
});
