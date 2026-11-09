import type { EffectAmount } from "../../effects.js";
import { defineCard } from "../define.js";

// X and the creatures are both fixed as it resolves (the rulings).
const X: EffectAmount = {
  aggregate: "count",
  filter: { ownedBy: "you", anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { hasAdventure: true }] },
  in: ["graveyards", "exile"],
};

export default defineCard({
  name: "Candlekeep Inspiration",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Until end of turn, creatures you control have base power and toughness X/X, where X is the number of cards you own in exile and in your graveyard that are instant cards, are sorcery cards, and/or have an Adventure.",
  targets: [],
  effect: {
    kind: "become",
    filter: { type: "creature", controlledBy: "you" },
    power: X,
    toughness: X,
    duration: "end-of-turn",
  },
});
