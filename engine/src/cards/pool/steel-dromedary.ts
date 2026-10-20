import { defineCard } from "../define.js";

const ENTERS_TEXT = "This creature enters tapped with two +1/+1 counters on it.";
const UNTAP_TEXT = "This creature doesn't untap during your untap step if it has a +1/+1 counter on it.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may move a +1/+1 counter from this creature onto target creature.";

export default defineCard({
  name: "Steel Dromedary",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Camel"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${UNTAP_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from Steel Dromedary onto target creature?",
        effect: { kind: "move-counters", from: "source", to: 0, counter: "+1/+1" },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true, counters: { kind: "+1/+1", amount: 2 } },
      text: ENTERS_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      doesntUntap: true,
      text: UNTAP_TEXT,
    },
  ],
});
