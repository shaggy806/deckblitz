import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature you control attacks a player alone, discard a card, then draw a card. Then put a +1/+1 counter on that creature for each card you've discarded this turn.";

export default defineCard({
  name: "Jiang Yanggu, Alone",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Berserker"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", defender: "player" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "draw", amount: 1 },
          {
            kind: "add-counter",
            target: "trigger-object",
            counter: "+1/+1",
            amount: { turnHistory: "discarded" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
