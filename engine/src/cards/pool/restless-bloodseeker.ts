import { defineCard } from "../define.js";

// "If you gained life this turn" is an intervening if: gaining life during the
// end step itself doesn't make it trigger (the ruling).
const END_TEXT =
  "At the beginning of your end step, if you gained life this turn, create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")";
const TRANSFORM_TEXT = "Sacrifice two Blood tokens: Transform this creature. Activate only as a sorcery.";

export default defineCard({
  name: "Restless Bloodseeker",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 1,
  toughness: 3,
  text: `${END_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Blood", token: true }, count: 2 } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
      sorcerySpeed: true,
    },
  ],
  faces: ["Restless Bloodseeker", "Bloodsoaked Reveler"],
  transform: true,
});
