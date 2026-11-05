import { defineCard } from "../define.js";

// EDHREC rank 3465. The modes are announced as the ability goes on the stack
// (rule 603.3c), each with its own target. "Its controller" is read off the
// target once it has gone: a spell's as it was on the stack, a permanent's as
// it last existed. A countered ability leaves nothing to read, so its controller
// draws first (Deny the Witch's order); countering an ability moves no card, so
// that order can't show. A spell keeps the printed order: a draw replaced by
// dredge could take the countered card from the graveyard.

const CHOOSE = "When Ertai Resurrected enters, choose up to one —";
const COUNTER = "Counter target spell, activated ability, or triggered ability. Its controller draws a card.";
const DESTROY = "Destroy another target creature or planeswalker. Its controller draws a card.";

export default defineCard({
  name: "Ertai Resurrected",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${CHOOSE}\n• ${COUNTER}\n• ${DESTROY}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 0,
        maxModes: 1,
        modes: [
          {
            text: COUNTER,
            targets: [{ kind: "stack", spells: "any", abilities: true }],
            effect: {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { isSpell: true } },
              then: {
                kind: "sequence",
                effects: [
                  { kind: "counter", target: 0 },
                  { kind: "draw", who: { controllerOfTarget: 0 }, amount: 1 },
                ],
              },
              else: {
                kind: "sequence",
                effects: [
                  { kind: "draw", who: { controllerOfTarget: 0 }, amount: 1 },
                  { kind: "counter", target: 0 },
                ],
              },
            },
          },
          {
            text: DESTROY,
            targets: [{ kind: "other", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } }],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "destroy", target: 0 },
                { kind: "draw", who: { controllerOfTarget: 0 }, amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: `${CHOOSE} ${COUNTER} ${DESTROY}`,
    },
  ],
});
