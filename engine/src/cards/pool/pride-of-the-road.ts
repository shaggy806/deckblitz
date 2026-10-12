import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 16811.
const COMBAT_TEXT =
  "At the beginning of combat on your turn, target creature or Vehicle you control gains double strike until end of turn.";

export default defineCard({
  name: "Pride of the Road",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Zombie", "Cat", "Warrior"],
  power: 2,
  toughness: 5,
  keywords: ["vigilance", "start-your-engines"],
  text: `Vigilance\n${START_YOUR_ENGINES_TEXT}\nMax speed — ${COMBAT_TEXT}`,
  static: [
    maxSpeed({
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "begin-combat", who: "you" },
          targets: [
            { kind: "permanent", whose: "you", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
          ],
          effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
          resolve: null,
          text: COMBAT_TEXT,
        },
      ],
      text: `Max speed — ${COMBAT_TEXT}`,
    }),
  ],
});
