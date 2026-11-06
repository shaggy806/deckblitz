import { defineCard } from "../define.js";

// EDHREC rank 32653.
// Makes Illusion → new token "Illusion Token 3/3 artifact" (scaffolded).

export default defineCard({
  name: "Adversary by Algorithm",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: {
    cost: "{3}{G}",
    returnToHand: { filter: { type: "creature" }, count: 1 },
    keyword: "beam-me-up",
  },
  text: "Create a 3/3 colorless Illusion artifact creature token.\nBeam me up {3}{G} (You may cast this card from your graveyard for {3}{G} if you also return a creature you control to its owner's hand. Then exile this spell.)",
  effect: { kind: "create-token", token: "Illusion Token 3/3 artifact", count: 1 },
});
