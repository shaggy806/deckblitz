import { defineCard } from "../define.js";

export default defineCard({
  name: "Vengeful Reaper",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Angel", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "deathtouch", "haste"],
  text: "Flying, deathtouch, haste\nForetell {1}{B} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{1}{B}" },
});
