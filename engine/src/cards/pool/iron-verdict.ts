import { defineCard } from "../define.js";

export default defineCard({
  name: "Iron Verdict",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Iron Verdict deals 5 damage to target tapped creature.\nForetell {W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "damage", amount: 5, target: 0 },
  foretell: { cost: "{W}" },
});
