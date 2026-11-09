import { defineCard } from "../define.js";

// EDHREC rank 8381. Tanazir's actual power and toughness, read once as the
// ability resolves (its ruling).
const ETB_TEXT = "When Tanazir Quandrix enters, double the number of +1/+1 counters on target creature you control.";
const ATTACK_TEXT =
  "Whenever Tanazir Quandrix attacks, you may have the base power and toughness of other creatures you control become equal to Tanazir Quandrix's power and toughness until end of turn.";

export default defineCard({
  name: "Tanazir Quandrix",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${ETB_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "double-counters", target: 0, counter: "+1/+1" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have the base power and toughness of your other creatures become Tanazir Quandrix's?",
        effect: {
          kind: "become",
          filter: { type: "creature", controlledBy: "you" },
          exceptSource: true,
          power: { powerOf: "source" },
          toughness: { toughnessOf: "source" },
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
