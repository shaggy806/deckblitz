import { defineCard } from "../define.js";

// EDHREC rank 14811.

const TOKEN_TEXT =
  "When this enchantment enters, create a 0/0 green and blue Fractal creature token. Put three +1/+1 counters on it.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, put a +1/+1 counter on target creature you control. It gains vigilance until end of turn.";

export default defineCard({
  name: "Additive Evolution",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${TOKEN_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Fractal Token", count: 1, thenCounters: { kind: "+1/+1", amount: 3 } },
      resolve: null,
      text: TOKEN_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
