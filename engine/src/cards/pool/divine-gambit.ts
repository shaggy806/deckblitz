import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 17727.
//
// "That player" is the exiled permanent's controller, read from last-known information (rule
// 608.2h) as Path to Exile's is. A permanent card is any card that isn't an instant or sorcery
// (its ruling); a double-faced card is judged by its front face.
export default defineCard({
  name: "Divine Gambit",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target artifact, creature, or enchantment an opponent controls. That player may put a permanent card from their hand onto the battlefield.",
  targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        options: [
          {
            putFromHand: { notTypes: ["instant", "sorcery"] },
            text: "Put a permanent card from your hand onto the battlefield",
          },
        ],
      },
    ],
  },
});
