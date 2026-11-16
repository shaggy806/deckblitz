import { defineCard } from "../define.js";

// EDHREC rank 11029. Both counters go on as it enters (rule 122.6), so it's
// hexproof and indestructible before anything sees it arrive.

export default defineCard({
  name: "Perennation",
  manaCost: "{3}{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["sorcery"],
  text: "Return target permanent card from your graveyard to the battlefield with a hexproof counter and an indestructible counter on it.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
  effect: {
    kind: "put-onto-battlefield",
    target: 0,
    withCounters: [
      { kind: "hexproof", amount: 1 },
      { kind: "indestructible", amount: 1 },
    ],
  },
});
