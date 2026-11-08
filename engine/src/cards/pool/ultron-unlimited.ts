import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever Ultron attacks, he connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)";
const CONNIVES_TEXT =
  "Whenever a creature you control connives, you may pay {1}. If you do, create a 2/2 colorless Robot Villain artifact creature token.";

// The generic connive trigger (`{ on: "event", event: "connives" }`, B278):
// Ultron's own connive sets off the second ability too.
export default defineCard({
  name: "Ultron, Unlimited",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${CONNIVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "event", event: "connives", who: "you-control" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to create a 2/2 Robot Villain token?",
        cost: "{1}",
        effect: { kind: "create-token", token: "Robot Villain Token", count: 1 },
      },
      resolve: null,
      text: CONNIVES_TEXT,
    },
  ],
});
