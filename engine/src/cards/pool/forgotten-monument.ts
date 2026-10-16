import { defineCard } from "../define.js";

// EDHREC rank 14223. The Lost Caverns of Ixalan.
//
// Esika's granted mana ability (`grantsActivated`), to the other Caves you
// control, with Mana Confluence's cost.

const GRANT_TEXT = 'Other Caves you control have "{T}, Pay 1 life: Add one mana of any color."';

export default defineCard({
  name: "Forgotten Monument",
  colors: [],
  types: ["land"],
  subtypes: ["Cave"],
  text: `{T}: Add {C}.\n${GRANT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Cave", controlledBy: "you" }, excludeSelf: true },
      grantsActivated: [
        {
          cost: { mana: null, tap: true, payLife: 1 },
          targets: [],
          effect: { kind: "add-mana", mana: "any-color", amount: 1 },
          resolve: null,
          text: "{T}, Pay 1 life: Add one mana of any color.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
