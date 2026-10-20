import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 10992.
export default defineCard({
  name: "Demon Bolt",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Demon Bolt deals 4 damage to target creature or planeswalker.\nForetell {R} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{R}" },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: 4, target: 0 },
});
