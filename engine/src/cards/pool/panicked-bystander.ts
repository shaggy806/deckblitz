import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 24925. "This creature or another creature you control dies" is
// two triggers (Zulaport Cutthroat's shape). The end-step check counts life
// gained this turn and ignores life lost (the ruling). The back face is
// Cackling Culprit.
const DIES_TEXT = "Whenever this creature or another creature you control dies, you gain 1 life.";
const END_TEXT = "At the beginning of your end step, if you gained 3 or more life this turn, transform this creature.";

const BYSTANDER_DIES: readonly TriggeredAbility[] = [
  {
    trigger: { on: "dies", who: "self" },
    targets: [],
    effect: { kind: "gain-life", amount: 1 },
    resolve: null,
    text: DIES_TEXT,
  },
  {
    trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
    targets: [],
    effect: { kind: "gain-life", amount: 1 },
    resolve: null,
    text: DIES_TEXT,
  },
];

export default defineCard({
  name: "Panicked Bystander",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 2,
  text: `${DIES_TEXT}\n${END_TEXT}`,
  triggered: [
    ...BYSTANDER_DIES,
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 3 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: ["Panicked Bystander", "Cackling Culprit"],
  transform: true,
});
