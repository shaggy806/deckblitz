import { defineCard } from "../define.js";

// EDHREC rank 24533. Kessig Prowler's transform; `blockAdditional` (rule 509.1a).

const BLOCK_TEXT = "This creature can block an additional creature each combat.";
const TRANSFORM_TEXT = "{6}{G}: Transform this creature.";

export default defineCard({
  name: "Tangleclaw Werewolf",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf", "Horror"],
  power: 2,
  toughness: 4,
  text: `${BLOCK_TEXT}\n${TRANSFORM_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}{G}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, blockAdditional: 1, text: BLOCK_TEXT }],
  faces: ["Tangleclaw Werewolf", "Fibrous Entangler"],
  transform: true,
});
