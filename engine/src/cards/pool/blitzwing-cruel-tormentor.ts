import { defineCard } from "../define.js";

// EDHREC rank 8502. Front face. More Than Meets the Eye (rule 702.162a) casts
// the back face converted; convert is transform (701.28, its rulings).
//
// The end-step loss is Astarion's "the life they lost this turn" read off the
// target; "if no life is lost this way" reads what that loss actually took.

const END_TEXT =
  "At the beginning of your end step, target opponent loses life equal to the life that player lost this turn. If no life is lost this way, convert Blitzwing.";

export default defineCard({
  name: "Blitzwing, Cruel Tormentor",
  manaCost: "{5}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 6,
  toughness: 5,
  text: `More Than Meets the Eye {3}{B} (You may cast this card converted for {3}{B}.)\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", target: 0, amount: { turnStat: "life-lost", target: 0 } },
          {
            kind: "conditional",
            condition: { kind: "amounts", left: { lifeLostThisWay: true }, op: "eq", right: 0 },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: ["Blitzwing, Cruel Tormentor", "Blitzwing, Adaptive Assailant"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{3}{B}" },
});
