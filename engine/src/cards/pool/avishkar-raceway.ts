import { defineCard } from "../define.js";
import { addManaAbility, maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 3810.
const LOOT_TEXT = "{3}, {T}, Discard a card: Draw a card.";

export default defineCard({
  name: "Avishkar Raceway",
  types: ["land"],
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n{T}: Add {C}.\nMax speed — ${LOOT_TEXT}`,
  activated: [addManaAbility({ mana: "C", text: "{T}: Add {C}." })],
  static: [
    maxSpeed({
      grantsActivated: [
        {
          cost: { mana: "{3}", tap: true, discard: { count: 1 } },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: LOOT_TEXT,
        },
      ],
      text: `Max speed — ${LOOT_TEXT}`,
    }),
  ],
});
