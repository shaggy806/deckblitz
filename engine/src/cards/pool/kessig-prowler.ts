import { defineCard } from "../define.js";

// EDHREC rank 22534.
const TRANSFORM_TEXT = "{4}{G}: Transform this creature.";

export default defineCard({
  name: "Kessig Prowler",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf", "Horror"],
  power: 2,
  toughness: 1,
  text: TRANSFORM_TEXT,
  activated: [
    {
      cost: { mana: "{4}{G}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Kessig Prowler", "Sinuous Predator"],
  transform: true,
});
