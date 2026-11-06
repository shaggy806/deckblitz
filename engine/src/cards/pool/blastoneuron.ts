import { defineCard } from "../define.js";

const ENTER =
  "When this creature enters, exile target creature card with mana value 3 or less from your graveyard. Create a token that's a copy of it. That token gains haste. Sacrifice it at the beginning of the next end step.";
const LEAVE = "Whenever one or more cards leave your graveyard, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Blastoneuron",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Jellyfish", "Leech"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER}\n${LEAVE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "create-token-copy",
            of: 0,
            count: 1,
            who: "you",
            gains: { keywords: ["haste"] },
            sacrificeAtEndStep: true,
          },
        ],
      },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: LEAVE,
    },
  ],
});
