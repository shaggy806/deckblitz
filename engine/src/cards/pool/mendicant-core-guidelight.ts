import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 3280. The power is a characteristic-defining ability (rule
// 604.3), counting itself. The copy remembers the original's choices — X,
// kicker and the like — and becomes a token without being "created" (the
// rulings); it's made even if the spell was countered in response, and
// keeps the original's targets (it says nothing of new ones).
const POWER_TEXT = "Mendicant Core's power is equal to the number of artifacts you control.";
const COPY_TEXT = "Whenever you cast an artifact spell, you may pay {1}. If you do, copy it.";

export default defineCard({
  name: "Mendicant Core, Guidelight",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 0,
  toughness: 3,
  keywords: ["start-your-engines"],
  text: `${POWER_TEXT}\n${START_YOUR_ENGINES_TEXT}\nMax speed — ${COPY_TEXT} (The copy becomes a token.)`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "artifact", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
    maxSpeed({
      grantsTriggered: [
        {
          trigger: { on: "cast-spell", who: "you", filter: { type: "artifact" } },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Pay {1} to copy that artifact spell?",
            cost: "{1}",
            effect: { kind: "copy-spell", target: "trigger-spell" },
          },
          resolve: null,
          text: COPY_TEXT,
        },
      ],
      text: `Max speed — ${COPY_TEXT}`,
    }),
  ],
});
