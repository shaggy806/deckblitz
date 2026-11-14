import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, you may turn this creature face down.";
const COPY_TEXT =
  "As this creature enters or is turned face up, you may choose another creature on the battlefield. If you do, " +
  "until this creature is turned face down, it becomes a copy of that creature, except it has " +
  `"${UPKEEP_TEXT}"`;

// Entering, it enters as the copy (its "as this enters" and enters triggers
// apply); turned face up, it's turned as the copy (rule 708.11) but doesn't
// enter (708.8). Turned face down, however, the copy ends, so it's turned up
// again for Vesuvan Shapeshifter's own morph cost and chooses again. The
// upkeep ability is a copiable value (rule 707.9a). Declining, it's a 0/0.
export default defineCard({
  name: "Vesuvan Shapeshifter",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  morph: { keyword: "morph", cost: "{1}{U}" },
  text: `${COPY_TEXT}\nMorph {1}{U}`,
  copyOnEnter: {
    filter: { type: "creature" },
    untilTurnedFaceDown: true,
    orTurnedFaceUp: true,
    except: {
      triggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Turn this creature face down?",
            effect: { kind: "turn-face-down", target: "source" },
          },
          resolve: null,
          text: UPKEEP_TEXT,
        },
      ],
    },
  },
});
