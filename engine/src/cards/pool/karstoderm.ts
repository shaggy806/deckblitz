import { defineCard } from "../define.js";

export default defineCard({
  name: "Karstoderm",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 0,
  toughness: 0,
  text: "This creature enters with five +1/+1 counters on it.\nWhenever an artifact enters, remove a +1/+1 counter from this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever an artifact enters, remove a +1/+1 counter from this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 5 } },
      text: "This creature enters with five +1/+1 counters on it.",
    },
  ],
});
