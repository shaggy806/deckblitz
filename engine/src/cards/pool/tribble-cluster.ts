import { defineCard } from "../define.js";

const COMBAT_TEXT = "At the beginning of combat on your turn, put a +1/+1 counter on this creature.";
const DIES_TEXT =
  'When this creature dies, create X 1/1 white Tribble creature tokens with "This token can\'t block," where X is this creature\'s power.';

export default defineCard({
  name: "Tribble Cluster",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Tribble"],
  power: 1,
  toughness: 1,
  text: `${COMBAT_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Tribble Token", count: { powerOf: "source" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
