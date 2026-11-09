import { defineCard } from "../define.js";

const SEAL_TEXT = "Cards in graveyards can't be the targets of spells or abilities.";
const EXILE_TEXT = "{4}, {T}: Exile this artifact and all cards from all graveyards. Draw a card.";

export default defineCard({
  name: "Silent Gravestone",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${SEAL_TEXT}\n${EXILE_TEXT}`,
  static: [{ affects: { scope: "self" }, text: SEAL_TEXT, prohibits: [{ act: "be-targeted", object: { inZone: "graveyard" } }] }],
  activated: [
    {
      // Exiling itself is part of the effect, not the cost: it goes as the
      // ability resolves, with the graveyards.
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "source" },
          { kind: "exile-graveyard", target: "each-player" },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
