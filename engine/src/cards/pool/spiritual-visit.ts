import { defineCard } from "../define.js";

export default defineCard({
  name: "Spiritual Visit",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Create a 1/1 colorless Spirit creature token.\nSplice onto Arcane {W} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  splice: { onto: "arcane", cost: "{W}" },
  effect: { kind: "create-token", token: "Spirit Token (Colorless)", count: 1 },
});
