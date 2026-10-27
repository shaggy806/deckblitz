import { defineCard } from "../define.js";

export default defineCard({
  name: "Invigorating Falls",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You gain life equal to the number of creature cards in all graveyards.",
  targets: [],
  effect: { kind: "gain-life", amount: { countInGraveyard: { type: "creature" } } },
});
