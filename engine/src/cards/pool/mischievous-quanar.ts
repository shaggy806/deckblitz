import { defineCard } from "../define.js";

const TURN_DOWN_TEXT = "{3}{U}{U}: Turn this creature face down.";
const FACE_UP_TEXT =
  "When this creature is turned face up, copy target instant or sorcery spell. You may choose new targets for that copy.";

export default defineCard({
  name: "Mischievous Quanar",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: `${TURN_DOWN_TEXT}\nMorph {1}{U}{U}\n${FACE_UP_TEXT}`,
  morph: { keyword: "morph", cost: "{1}{U}{U}" },
  activated: [
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "turn-face-down", target: "source" },
      resolve: null,
      text: TURN_DOWN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["instant-or-sorcery-spell"],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
