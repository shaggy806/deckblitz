import { defineCard } from "../define.js";

// Spined Tyrranax's "you may pay … When you do": paid once, one counter (the
// second ruling); the target is chosen after paying (the first).
const TEXT =
  "At the beginning of combat on your turn, you may pay {G}{U}. When you do, put a +1/+1 counter on another target creature you control, and that creature gains flying until end of turn.";

export default defineCard({
  name: "Skyrider Patrol",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {G}{U} to put a +1/+1 counter on another creature you control and give it flying?",
        cost: "{G}{U}",
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "other", of: "creature-you-control" }],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
              { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
            ],
          },
          text: "When you do, put a +1/+1 counter on another target creature you control, and that creature gains flying until end of turn.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
