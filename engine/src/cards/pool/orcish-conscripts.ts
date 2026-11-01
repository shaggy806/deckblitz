import { defineCard } from "../define.js";

const ATTACK_TEXT = "This creature can't attack unless at least two other creatures attack.";
const BLOCK_TEXT = "This creature can't block unless at least two other creatures block.";

export default defineCard({
  name: "Orcish Conscripts",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc"],
  power: 2,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${BLOCK_TEXT}`,
  static: [
    { affects: { scope: "self" }, restrictions: ["cant-attack-unless-two-others"], text: ATTACK_TEXT },
    { affects: { scope: "self" }, restrictions: ["cant-block-unless-two-others"], text: BLOCK_TEXT },
  ],
});
