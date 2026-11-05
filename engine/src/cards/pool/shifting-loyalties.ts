import { defineCard } from "../define.js";

// EDHREC rank 21878.

export default defineCard({
  name: "Shifting Loyalties",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exchange control of two target permanents that share a card type. (Artifact, creature, enchantment, land, and planeswalker are card types.)",
  targets: [
    "permanent",
    { kind: "other", of: "permanent", than: { slot: 0 }, shares: { kind: "card" } },
  ],
  effect: { kind: "exchange-control", objects: [0, 1] },
});
