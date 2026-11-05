import { defineCard } from "../define.js";

// Devoid: colorless for all its black mana cost (`colors: []`).
// The target opponent chooses which card to exile as it resolves (its
// ruling); an empty graveyard still gives the Scion and the card.
export default defineCard({
  name: "Grave Birthing",
  manaCost: "{2}{B}",
  colors: [],
  types: ["instant"],
  text: "Devoid (This card has no color.)\nTarget opponent exiles a card from their graveyard. You create a 1/1 colorless Eldrazi Scion creature token. It has \"Sacrifice this token: Add {C}.\"\nDraw a card.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: { target: 0 },
        effect: { kind: "look-and-choose", player: "that-player", zone: "graveyard", min: 1, max: 1, destination: "exile", leftover: "stay" },
      },
      { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
