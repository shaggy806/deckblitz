import { defineCard } from "../define.js";

export default defineCard({
  name: "Hurl Through Hell",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "Exile target creature. Until the end of your next turn, you may cast that card and you may spend mana as though it were mana of any color to cast that spell.",
  targets: ["creature"],
  effect: { kind: "exile", target: 0, mayCast: { duration: "until-end-of-your-next-turn", spendAs: "any-color" } },
});
