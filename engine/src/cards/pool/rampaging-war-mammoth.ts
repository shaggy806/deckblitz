import { defineCard } from "../define.js";

const CYCLING_TEXT = "Cycling {X}{2}{R} ({X}{2}{R}, Discard this card: Draw a card.)";
const CYCLE_TEXT = "When you cycle this card, destroy up to X target artifacts.";

export default defineCard({
  name: "Rampaging War Mammoth",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 9,
  toughness: 7,
  keywords: ["trample"],
  cycling: { cost: "{X}{2}{R}" },
  text: `Trample\n${CYCLING_TEXT}\n${CYCLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [
        { kind: "any-number", of: { kind: "permanent", filter: { type: "artifact" } }, max: { triggerValue: true } },
      ],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
