import { defineCard } from "../define.js";

// Dissension. The control change lasts while this stays on the battlefield,
// whatever happens to the counters (the ruling) — `whileSource`.
const GAIN =
  "{U}, {T}: Gain control of target creature with a +1/+1 counter on it for as long as this creature remains on the battlefield.";

export default defineCard({
  name: "Cytoplast Manipulator",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Mutant"],
  power: 0,
  toughness: 0,
  text: `Graft 2 (This creature enters with two +1/+1 counters on it. Whenever another creature enters, you may move a +1/+1 counter from this creature onto it.)\n${GAIN}`,
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [
        { kind: "permanent", filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } },
      ],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSource: true },
      resolve: null,
      text: GAIN,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from Cytoplast Manipulator onto the creature that entered?",
        effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" },
      },
      resolve: null,
      text: "Graft 2",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "Graft 2",
    },
  ],
});
