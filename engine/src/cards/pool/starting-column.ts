import { defineCard } from "../define.js";
import { addManaAbility, maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 8198.
const SAC_TEXT = "{T}, Sacrifice this artifact: Draw two cards, then discard a card.";

export default defineCard({
  name: "Starting Column",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n{T}: Add one mana of any color.\nMax speed — ${SAC_TEXT}`,
  activated: [addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." })],
  static: [
    maxSpeed({
      grantsActivated: [
        {
          cost: { mana: null, tap: true, sacrifice: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 2 },
              { kind: "discard", target: "you", amount: 1 },
            ],
          },
          resolve: null,
          text: SAC_TEXT,
        },
      ],
      text: `Max speed — ${SAC_TEXT}`,
    }),
  ],
});
