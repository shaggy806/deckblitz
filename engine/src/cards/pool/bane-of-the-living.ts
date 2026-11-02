import { defineCard } from "../define.js";

// EDHREC rank 10149. X is announced as it's turned face up (rule 702.37f):
// turned up any other way, it's 0.
const UP_TEXT = "When this creature is turned face up, all creatures get -X/-X until end of turn.";

export default defineCard({
  name: "Bane of the Living",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 4,
  toughness: 3,
  text: `Morph {X}{B}{B}\n${UP_TEXT}`,
  morph: { keyword: "morph", cost: "{X}{B}{B}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: { product: [{ triggerValue: true }, -1] },
        toughness: { product: [{ triggerValue: true }, -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
