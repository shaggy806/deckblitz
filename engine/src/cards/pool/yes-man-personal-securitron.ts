import { defineCard } from "../define.js";

// Rulings:
//   [2024-03-08] If Yes Man isn't on the battlefield as its first ability resolves, or if the target
//     opponent is an illegal target as the ability tries to resolve, nothing will happen. You won't
//     draw two cards, because that effect is part of a reflexive triggered ability that triggers
//     only when they gain control of Yes Man.
const ACTIVATE_TEXT =
  "{T}: Target opponent gains control of Yes Man. When they do, you draw two cards and put a quest counter on Yes Man. Activate only during your turn.";
const REFLEXIVE_TEXT = "When they do, you draw two cards and put a quest counter on Yes Man.";
const WILD_CARD_TEXT =
  "Wild Card — When Yes Man leaves the battlefield, its owner creates a tapped 1/1 white Soldier creature token for each quest counter on it.";

export default defineCard({
  name: "Yes Man, Personal Securitron",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 2,
  text: `${ACTIVATE_TEXT}\n${WILD_CARD_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["opponent"],
      condition: { kind: "your-turn" },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: "source", untilEndOfTurn: false, who: { target: 0 } },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "gained-control" },
            then: {
              kind: "reflexive-trigger",
              targets: [],
              text: REFLEXIVE_TEXT,
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "draw", amount: 2 },
                  { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
                ],
              },
            },
          },
        ],
      },
      resolve: null,
      text: ACTIVATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "as-player",
        who: "source-owner",
        effect: {
          kind: "create-token",
          token: "Soldier Token",
          count: { countersOn: "source", counter: "quest" },
          tapped: true,
        },
      },
      resolve: null,
      text: WILD_CARD_TEXT,
    },
  ],
});
