import { defineCard } from "../define.js";

// EDHREC rank 22534.

export default defineCard({
  name: "Kessig Prowler",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf", "Horror"],
  power: 2,
  toughness: 1,
  text: "{4}{G}: Transform this creature.",
  activated: [
    {
      cost: { mana: "{4}{G}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{4}{G}: Transform this creature.",
    },
  ],
  faces: ["Kessig Prowler", "Sinuous Predator"],
  transform: true,
});
