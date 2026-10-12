import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 16269. Drafna's "copy target spell you control", with new
// targets allowed (rule 707.10c); a copy of a permanent spell becomes a
// token.
const COPY_TEXT = "{1}, Sacrifice this creature: Copy target spell you control. You may choose new targets for the copy.";

export default defineCard({
  name: "Slick Imitator",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 1,
  toughness: 3,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\nMax speed — ${COPY_TEXT} (A copy of a permanent spell becomes a token.)`,
  static: [
    maxSpeed({
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false, sacrifice: "self" },
          targets: [{ kind: "spell", whose: "you", filter: {} }],
          effect: { kind: "copy-spell", target: 0, newTargets: true },
          resolve: null,
          text: COPY_TEXT,
        },
      ],
      text: `Max speed — ${COPY_TEXT}`,
    }),
  ],
});
