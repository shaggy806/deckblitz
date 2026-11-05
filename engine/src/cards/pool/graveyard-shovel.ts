import { defineCard } from "../define.js";

// The targeted player chooses the card as it resolves (its ruling).
const TEXT = "{2}, {T}: Target player exiles a card from their graveyard. If it's a creature card, you gain 2 life.";

export default defineCard({
  name: "Graveyard Shovel",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: { target: 0 },
            effect: { kind: "look-and-choose", player: "that-player", zone: "graveyard", min: 1, max: 1, destination: "exile", leftover: "stay" },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
            then: { kind: "gain-life", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
