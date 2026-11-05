import { defineCard } from "../define.js";

// Still on the stack as it counts, so never itself; a face-down card has no types
// (the rulings).
export default defineCard({
  name: "Beacon Bolt",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  flashback: { cost: "{1}{U}{R}", discard: 1, keyword: "jump-start" },
  text: "Beacon Bolt deals damage to target creature equal to the total number of instant and sorcery cards you own in exile and in your graveyard.\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
  targets: ["creature"],
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      aggregate: "count",
      filter: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" },
      in: ["graveyards", "exile"],
    },
  },
});
