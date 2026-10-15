import { defineCard } from "../define.js";

// EDHREC rank 8202. Final Fantasy.
//
// Rulings:
//   [2025-06-06] If the target creature card is an illegal target as General Leo Cristophe's
//     ability tries to resolve, it won't resolve and none of its effects will happen. You won't put
//     +1/+1 counters on General Leo Cristophe.
//   [2025-06-06] If a card in your graveyard has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//
// Eddie Brock's reanimation with an optional slot, then a counter per
// creature you control, counted after the return (so the returned creature and
// Leo himself count). A chosen target gone illegal makes the whole ability
// fizzle (rule 608.2b — the first ruling); none chosen, the counters still go
// on.
const ENTER_TEXT =
  "When General Leo Cristophe enters, return up to one target creature card with mana value 3 or less from your graveyard to the battlefield. Then put a +1/+1 counter on General Leo Cristophe for each creature you control.";

export default defineCard({
  name: "General Leo Cristophe",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0, underYourControl: true },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { countOf: { type: "creature", controlledBy: "you" } },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
