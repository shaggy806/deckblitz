import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Rulings:
//   If the card you exile has foretell, it will have two foretell costs, the one printed on it and
//     the one given to it by Ethereal Valkyrie. You may cast that card for either of its foretell
//     costs.
//   Because the card in exile becomes foretold, you can look at it in exile.
//   If you foretell a modal double-faced card, the foretell cost will be based on the mana cost of
//     the face you cast from exile. If its back face is a land face, you can't play it as a land.
//   The reduction of the foretell cost applies only to generic mana in the foretell cost.
//   Although the card you exile becomes foretold, you did not foretell it. An ability that
//     triggers whenever you foretell a card will not trigger.

const TEXT =
  "Whenever this creature enters or attacks, draw a card, then exile a card from your hand face down. It becomes foretold. Its foretell cost is its mana cost reduced by {2}. (On a later turn, you may cast it for its foretell cost, even if this creature has left the battlefield.)";

const effect: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "draw", amount: 1 },
    {
      kind: "look-and-choose",
      zone: "hand",
      min: 1,
      max: 1,
      destination: "exile-face-down",
      leftover: "stay",
      unlinked: true,
      then: { kind: "become-foretold", target: 0, costReducedBy: 2 },
    },
  ],
};

export default defineCard({
  name: "Ethereal Valkyrie",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Spirit", "Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, resolve: null, text: TEXT, targets: [], effect },
    { trigger: { on: "attacks", who: "self" }, resolve: null, text: TEXT, targets: [], effect },
  ],
});
