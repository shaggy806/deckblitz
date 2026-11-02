import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, move all +1/+1 counters from all creatures onto it.";

export default defineCard({
  name: "Spike Cannibal",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spike"],
  power: 0,
  toughness: 0,
  text: `This creature enters with a +1/+1 counter on it.\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "This creature enters with a +1/+1 counter on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature" },
        exceptSource: true,
        effect: { kind: "move-counters", from: 0, to: "source", counter: "+1/+1", amount: "all" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
