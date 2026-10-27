import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29701.

export default defineCard({
  name: "Wandering Stream",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Domain — You gain 2 life for each basic land type among lands you control.",
  targets: [],
  effect: { kind: "gain-life", amount: { product: [2, { basicLandTypes: "you" }] } },
});
