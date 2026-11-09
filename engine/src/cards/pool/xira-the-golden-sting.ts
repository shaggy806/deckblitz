import { defineCard } from "../define.js";

const DIES_TEXT =
  "When that creature dies, if it has an egg counter on it, draw a card and create a 1/1 black Insect creature token with flying.";
const ATTACK_TEXT = `Whenever Xira attacks, put an egg counter on another target creature without an egg counter on it. ${DIES_TEXT}`;

export default defineCard({
  name: "Xira, the Golden Sting",
  manaCost: "{1}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Insect", "Assassin"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", filter: { type: "creature", counters: { kind: "egg", compare: { op: "eq", n: 0 } } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "egg", amount: 1 },
          {
            kind: "delayed-trigger",
            at: { leaves: 0, to: ["graveyard"] },
            if: {
              kind: "object-matches",
              object: "trigger-object",
              filter: { counters: { kind: "egg", compare: { op: "gte", n: 1 } } },
            },
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                { kind: "create-token", token: "Insect Token (Black, Flying)", count: 1 },
              ],
            },
            text: DIES_TEXT,
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
