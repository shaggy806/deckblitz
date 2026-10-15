import { defineCard } from "../define.js";

// EDHREC rank 26290.

const ETB_TEXT =
  "When this artifact enters, tap up to one target creature and put two stun counters on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";
const TAP_TEXT = "{3}{U}, {T}: Tap target creature.";

export default defineCard({
  name: "Collector's Case",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `${ETB_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 2 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
