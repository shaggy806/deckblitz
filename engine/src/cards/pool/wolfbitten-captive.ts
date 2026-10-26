import { defineCard } from "../define.js";

export default defineCard({
  name: "Wolfbitten Captive",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 1,
  toughness: 1,
  text: "{1}{G}: This creature gets +2/+2 until end of turn. Activate only once each turn.\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{G}: This creature gets +2/+2 until end of turn. Activate only once each turn.",
      oncePerTurn: true,
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
  faces: ["Wolfbitten Captive", "Krallenhorde Killer"],
  transform: true,
});
