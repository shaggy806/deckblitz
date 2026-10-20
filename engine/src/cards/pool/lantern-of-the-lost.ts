import { defineCard } from "../define.js";

// EDHREC rank 12115.
const ENTER_TEXT = "When this artifact enters, exile target card from a graveyard.";
const EXILE_TEXT = "{1}, {T}, Exile this artifact: Exile all cards from all graveyards, then draw a card.";

export default defineCard({
  name: "Lantern of the Lost",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, exileSelf: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: "each-player" },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
