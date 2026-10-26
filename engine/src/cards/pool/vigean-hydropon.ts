import { defineCard } from "../define.js";

// EDHREC rank 25678.

export default defineCard({
  name: "Vigean Hydropon",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Plant", "Mutant"],
  power: 0,
  toughness: 0,
  text: "Graft 5 (This creature enters with five +1/+1 counters on it. Whenever another creature enters, you may move a +1/+1 counter from this creature onto it.)\nThis creature can't attack or block.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from Vigean Hydropon onto the creature that entered?",
        effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" },
      },
      resolve: null,
      text: "Graft 5",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 5 } },
      text: "Graft 5",
    },
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack", "cant-block"],
      text: "This creature can't attack or block.",
    },
  ],
});
