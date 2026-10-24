import { defineCard } from "../define.js";

const TRIGGER_TEXT = "Whenever you cast a noncreature spell, choose one —";
const TAP_MODE = "Tap target creature.";
const STRIKE_MODE = "This creature gains first strike and lifelink until end of turn.";
const BLINK_MODE = "Exile this creature, then return it to the battlefield tapped under its owner's control.";

export default defineCard({
  name: "Ojutai Exemplars",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 4,
  toughness: 4,
  text: `${TRIGGER_TEXT}\n• ${TAP_MODE}\n• ${STRIKE_MODE}\n• ${BLINK_MODE}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: TAP_MODE, targets: ["creature"], effect: { kind: "tap", target: 0 } },
          {
            text: STRIKE_MODE,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
                { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
              ],
            },
          },
          // A flicker of the source: one that has left in response stays
          // where it is (its ruling, rule 400.7).
          { text: BLINK_MODE, effect: { kind: "flicker", target: "source", tapped: true } },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${TAP_MODE} ${STRIKE_MODE} ${BLINK_MODE}`,
    },
  ],
});
