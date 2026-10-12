import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 10786.
const TAPPED_TEXT = "This creature enters tapped.";
const DRAW_TEXT = "{B}, Sacrifice another creature or Vehicle: Draw a card.";

export default defineCard({
  name: "Gas Guzzler",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${TAPPED_TEXT}\nMax speed — ${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: TAPPED_TEXT,
    },
    maxSpeed({
      grantsActivated: [
        {
          cost: {
            mana: "{B}",
            tap: false,
            sacrifice: { filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
          },
          otherOnly: true,
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: DRAW_TEXT,
        },
      ],
      text: `Max speed — ${DRAW_TEXT}`,
    }),
  ],
});
