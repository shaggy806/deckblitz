import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 9494. White Auracite's O-Ring shape (rule 610.3b), and a max
// speed counter ability.
const ENTERS_TEXT =
  "When this artifact enters, exile target nonland permanent an opponent controls until this artifact leaves the battlefield.";
const COUNTER_TEXT =
  "{T}: Put a +1/+1 counter on target creature or Vehicle you control. Activate only as a sorcery.";

export default defineCard({
  name: "Perilous Snare",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${ENTERS_TEXT}\nMax speed — ${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this artifact leaves the battlefield, return the exiled card.",
    },
  ],
  static: [
    maxSpeed({
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [
            { kind: "permanent", whose: "you", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
          ],
          effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          resolve: null,
          sorcerySpeed: true,
          text: COUNTER_TEXT,
        },
      ],
      text: `Max speed — ${COUNTER_TEXT}`,
    }),
  ],
});
