import { defineCard } from "../define.js";

// EDHREC rank 21794. Matt Murdock's "you may pay. When you do" — the target
// is chosen once the {2}{G} is paid (the ruling).

const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may pay {2}{G}. When you do, put a +1/+1 counter on target creature. That creature gains trample until end of turn.";

export default defineCard({
  name: "Spined Tyrranax",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Beast"],
  power: 5,
  toughness: 5,
  text: `${COMBAT_TEXT} (It can deal excess combat damage to the player or planeswalker it's attacking.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{G} to put a +1/+1 counter on target creature and give it trample?",
        cost: "{2}{G}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
              { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
            ],
          },
          text: "When you do, put a +1/+1 counter on target creature. That creature gains trample until end of turn.",
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
