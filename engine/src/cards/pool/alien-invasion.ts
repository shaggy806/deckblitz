import { defineCard } from "../define.js";

// EDHREC rank 19708.
// Makes Alien → "Alien Token (Alien Invasion)".
//
// The token's counters are counted as the ability resolves, before this
// trigger's own invasion counter is added (so the first token gets none), and
// put on once it has entered (`thenCounters`); the invasion counter comes
// after.
const TEXT =
  "At the beginning of combat on your turn, create a 1/1 red Alien creature token with haste and \"This token attacks each combat if able.\" Put a +1/+1 counter on it for each invasion counter on this enchantment, then put an invasion counter on this enchantment.";

export default defineCard({
  name: "Alien Invasion",
  manaCost: "{1}{R}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-token",
            token: "Alien Token (Alien Invasion)",
            count: 1,
            thenCounters: { kind: "+1/+1", amount: { countersOn: "source", counter: "invasion" } },
          },
          { kind: "add-counter", target: "source", counter: "invasion", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
