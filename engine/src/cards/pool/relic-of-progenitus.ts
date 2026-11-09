import { defineCard } from "../define.js";

// EDHREC rank 4909.
export default defineCard({
  name: "Relic of Progenitus",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Target player exiles a card from their graveyard.\n{1}, Exile this artifact: Exile all graveyards. Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "graveyard",
          min: 1,
          max: 1,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      resolve: null,
      text: "{T}: Target player exiles a card from their graveyard.",
    },
    {
      cost: { mana: "{1}", tap: false, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: "each-player" },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "{1}, Exile this artifact: Exile all graveyards. Draw a card.",
    },
  ],
});
