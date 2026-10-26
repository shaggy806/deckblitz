import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 27725.

export default defineCard({
  name: "Vitalizing Cascade",
  manaCost: "{X}{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "You gain X plus 3 life.",
  targets: [],
  effect: { kind: "gain-life", amount: { sum: ["x", 3] } },
});
