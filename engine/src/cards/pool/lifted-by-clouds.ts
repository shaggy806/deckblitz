import { defineCard } from "../define.js";

// EDHREC rank 25544.

export default defineCard({
  name: "Lifted by Clouds",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: { onto: "arcane", cost: "{1}{U}" },
  text: "Target creature gains flying until end of turn.\nSplice onto Arcane {1}{U} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["creature"],
  effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
});
