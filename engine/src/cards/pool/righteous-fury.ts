import { defineCard } from "../define.js";

// Portal. EDHREC rank 21281.
export default defineCard({
  name: "Righteous Fury",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all tapped creatures. You gain 2 life for each creature destroyed this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature", tapped: true } },
      { kind: "gain-life", amount: { product: [{ thisWay: "destroyed" }, 2] } },
    ],
  },
});
