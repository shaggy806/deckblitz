import { defineCard } from "../define.js";

// EDHREC rank 25632. Two restrictions on the whole declaration (rules 508.1c,
// 509.1b), read as it's made (`combat/company.ts`): at least one of the
// creatures declared beside it has greater power than it then. Whatever that
// creature attacks or blocks; never again once declared.

const ATTACK_TEXT = "This creature can't attack unless a creature with greater power also attacks.";
const BLOCK_TEXT = "This creature can't block unless a creature with greater power also blocks.";

export default defineCard({
  name: "Okk",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 4,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${BLOCK_TEXT}`,
  static: [
    { affects: { scope: "self" }, restrictions: ["cant-attack-unless-greater-power-joins"], text: ATTACK_TEXT },
    { affects: { scope: "self" }, restrictions: ["cant-block-unless-greater-power-joins"], text: BLOCK_TEXT },
  ],
});
