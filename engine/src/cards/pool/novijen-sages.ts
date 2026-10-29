import { defineCard } from "../define.js";

// EDHREC rank 21842.

export default defineCard({
  name: "Novijen Sages",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Advisor", "Mutant"],
  power: 0,
  toughness: 0,
  text: "Graft 4 (This creature enters with four +1/+1 counters on it. Whenever another creature enters, you may move a +1/+1 counter from this creature onto it.)\n{1}, Remove two +1/+1 counters from among creatures you control: Draw a card.",
  activated: [
    {
      cost: {
        mana: "{1}",
        tap: false,
        removeCounter: { kind: "+1/+1", count: 2, from: { type: "creature" }, among: true },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}, Remove two +1/+1 counters from among creatures you control: Draw a card.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from Novijen Sages onto the creature that entered?",
        effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" },
      },
      resolve: null,
      text: "Graft 4",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
      text: "Graft 4",
    },
  ],
});
