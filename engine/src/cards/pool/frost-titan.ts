import { defineCard } from "../define.js";

const WARD_TEXT =
  "Whenever this creature becomes the target of a spell or ability an opponent controls, counter that spell or ability unless its controller pays {2}.";
const TAP_TEXT =
  "Whenever this creature enters or attacks, tap target permanent. It doesn't untap during its controller's next untap step.";
const TAP = { kind: "tap", target: 0, doesntUntapNext: true } as const;

export default defineCard({
  name: "Frost Titan",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 6,
  toughness: 6,
  text: `${WARD_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: WARD_TEXT,
    },
    { trigger: { on: "enters-battlefield", who: "self" }, targets: ["permanent"], effect: TAP, resolve: null, text: TAP_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: ["permanent"], effect: TAP, resolve: null, text: TAP_TEXT },
  ],
});
