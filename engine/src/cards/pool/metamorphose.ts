import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 25033.
//
// "That opponent" is the targeted permanent's controller, read from last-known information
// (rule 608.2h), as Divine Gambit's is.
export default defineCard({
  name: "Metamorphose",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put target permanent an opponent controls on top of its owner's library. That opponent may put an artifact, creature, enchantment, or land card from their hand onto the battlefield.",
  targets: [{ kind: "permanent", whose: "opponent", filter: {} }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-library", target: 0, position: "top" },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        options: [
          {
            putFromHand: { typesAnyOf: ["artifact", "creature", "enchantment", "land"] },
            text: "Put an artifact, creature, enchantment, or land card from your hand onto the battlefield",
          },
        ],
      },
    ],
  },
});
