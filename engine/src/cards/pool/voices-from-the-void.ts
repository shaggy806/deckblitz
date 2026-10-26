import { defineCard } from "../define.js";

// EDHREC rank 30593.

export default defineCard({
  name: "Voices from the Void",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Domain — Target player discards a card for each basic land type among lands you control.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: { basicLandTypes: "you" } },
});
