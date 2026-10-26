import { defineCard } from "../define.js";

// EDHREC rank 21423.
//
// Rulings:
//   [2012-05-01] If the targeted creature is an illegal target when the ability tries to resolve,
//     the ability won't resolve and none of its effects will happen. The creature's controller
//     won't put a Spirit token onto the battlefield.
//   [2012-05-01] You can tap any three untapped Humans you control, including ones you haven't
//     controlled continuously since the beginning of your most recent turn, to pay the cost of the
//     activated ability.
const TEXT =
  "{3}, {T}, Tap three untapped Humans you control: Destroy target creature. Its controller creates a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Gallows at Willow Hill",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{3}",
        tap: true,
        tapOthers: { count: 3, filter: { subtype: "Human", controlledBy: "you" } },
      },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "create-token", token: "Spirit Token", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
