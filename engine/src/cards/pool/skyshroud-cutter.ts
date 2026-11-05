import { defineCard } from "../define.js";

// EDHREC rank 25314.

export default defineCard({
  name: "Skyshroud Cutter",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  alternativeCost: {
    mana: "{0}",
    othersGainLife: { amount: 5, who: "each-other-player" },
    condition: { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 },
  },
  text: "If you control a Forest, rather than pay this spell's mana cost, you may have each other player gain 5 life.",
});
