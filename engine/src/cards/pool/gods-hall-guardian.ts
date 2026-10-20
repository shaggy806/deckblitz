import { defineCard } from "../define.js";

export default defineCard({
  name: "Gods' Hall Guardian",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 6,
  keywords: ["vigilance"],
  text: "Vigilance\nForetell {3}{W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{3}{W}" },
});
