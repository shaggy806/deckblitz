import { defineCard } from "../define.js";

// EDHREC rank 22507.
//
// One choice over your hand and graveyard together (`from:
// "hand-or-graveyard"`); "that creature" is whatever this resolution put onto
// the battlefield (`thisWay: "put-onto-battlefield"`), and the delayed return
// is bound to it the way Nahiri, the Harbinger's is.
//
// Rulings:
//   [2015-02-25] The creature you put onto the battlefield will be returned to your hand only if
//     it's still on the battlefield as the delayed triggered ability resolves during the next end
//     step. If it leaves the battlefield before then, it will remain wherever it is.
//   [2015-02-25] The delayed triggered ability that returns the creature to your hand will trigger
//     even if Swift Warkite leaves the battlefield before the next end step.
//   [2015-02-25] You can't put creatures onto the battlefield face down this way.

const ENTER_TEXT =
  "When this creature enters, you may put a creature card with mana value 3 or less from your hand or graveyard onto the battlefield. That creature gains haste. Return it to your hand at the beginning of the next end step.";

export default defineCard({
  name: "Swift Warkite",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a creature card with mana value 3 or less from your hand or graveyard onto the battlefield?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "return-from-graveyard",
              filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
              destination: "battlefield",
              count: 1,
              from: "hand-or-graveyard",
            },
            {
              kind: "grant-keyword-all",
              filter: { thisWay: "put-onto-battlefield" },
              keyword: "haste",
              duration: "permanent",
            },
            {
              kind: "delayed-trigger",
              at: "next-end-step",
              about: "put-onto-battlefield",
              effect: { kind: "return-to-hand", target: 0 },
              text: "Return it to your hand.",
            },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
