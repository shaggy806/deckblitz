import { defineCard } from "../define.js";

// EDHREC rank 4564.

export default defineCard({
  name: "Securitron Squadron",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  kicker: { cost: "{3}", multi: true, keyword: "squad" },
  text: "Squad {3} (As an additional cost to cast this spell, you may pay {3} any number of times. When this creature enters, create that many tokens that are copies of it.)\nVigilance\nWhenever a creature token you control enters, put a +1/+1 counter on it.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, perTimeKicked: true },
      resolve: null,
      text: "When this creature enters, if its squad cost was paid, create a token that's a copy of it for each time its squad cost was paid.",
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: true, type: "creature" },
      },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature token you control enters, put a +1/+1 counter on it.",
    },
  ],
});
