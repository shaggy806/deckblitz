import { defineCard } from "../define.js";

// Graveyard order (rule 404.2): `top-of-graveyard`'s `bottom`, the other end of the pile.

const BOTTOM_TEXT = "{T}: Exile the bottom card of target player's graveyard.";
const SAC_TEXT = "{1}, Sacrifice this artifact: Exile target card from a graveyard. Draw a card.";

export default defineCard({
  name: "Phyrexian Furnace",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${BOTTOM_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: { kind: "top-of-graveyard", whose: 0, bottom: true, then: { kind: "exile", target: 0 } },
      resolve: null,
      text: BOTTOM_TEXT,
    },
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
