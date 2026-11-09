import { defineCard } from "../define.js";

// EDHREC rank 6877. Front face. More Than Meets the Eye (rule 702.162a) casts
// the back face converted; convert is transform (701.28, its rulings).
export default defineCard({
  name: "Starscream, Power Hungry",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "More Than Meets the Eye {2}{B} (You may cast this card converted for {2}{B}.)\nFlying\nWhenever you draw a card, if you're the monarch, target opponent loses 2 life.\nWhenever one or more creatures deal combat damage to you, convert Starscream.",
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      condition: { kind: "monarch", who: "you" },
      targets: ["opponent"],
      effect: { kind: "lose-life", amount: 2, target: 0 },
      resolve: null,
      text: "Whenever you draw a card, if you're the monarch, target opponent loses 2 life.",
    },
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "you", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "Whenever one or more creatures deal combat damage to you, convert Starscream.",
    },
  ],
  faces: ["Starscream, Power Hungry", "Starscream, Seeker Leader"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{2}{B}" },
});
