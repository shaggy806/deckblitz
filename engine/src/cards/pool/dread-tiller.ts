import { defineCard } from "../define.js";

// EDHREC rank 5933. Any creature with a -1/-1 counter on it as it last existed,
// whoever controlled it.

const DIES_TEXT = "Whenever a creature with a -1/-1 counter on it dies, you may put a land card from your hand or graveyard onto the battlefield tapped.";

export default defineCard({
  name: "Dread Tiller",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 4,
  text: `When this creature enters, put a -1/-1 counter on target creature.\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "When this creature enters, put a -1/-1 counter on target creature.",
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", counters: { kind: "-1/-1", compare: { op: "gte", n: 1 } } } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a land card from your hand or graveyard onto the battlefield tapped?",
        effect: {
          kind: "return-from-graveyard",
          filter: { type: "land" },
          destination: "battlefield",
          count: 1,
          from: "hand-or-graveyard",
          enterTapped: true,
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
