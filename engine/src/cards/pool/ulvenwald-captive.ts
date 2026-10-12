import { defineCard } from "../define.js";

export default defineCard({
  name: "Ulvenwald Captive",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf", "Horror"],
  power: 1,
  toughness: 2,
  keywords: ["defender"],
  text: "Defender\n{T}: Add {G}.\n{5}{G}{G}: Transform this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
    {
      cost: { mana: "{5}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{5}{G}{G}: Transform this creature.",
    },
  ],
  faces: ["Ulvenwald Captive", "Ulvenwald Abomination"],
  transform: true,
});
