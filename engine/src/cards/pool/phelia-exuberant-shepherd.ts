import { defineCard } from "../define.js";

// Modern Horizons 3 (MH3).
//
// The return is a delayed trigger of the attack's (`flicker`'s `returnAt`), and
// "if it entered under your control" is part of it (`returnThen`), read off what
// that return put onto the battlefield. Rulings: a token exiled this way is
// gone and returns nothing; the card returns even with Phelia gone; and Phelia
// is a good dog.
const ATTACK =
  "Whenever Phelia attacks, exile up to one other target nonland permanent. At the beginning of the next end step, return that card to the battlefield under its owner's control. If it entered under your control, put a +1/+1 counter on Phelia.";

export default defineCard({
  name: "Phelia, Exuberant Shepherd",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnThen: {
          kind: "conditional",
          condition: { kind: "this-way", what: "put-onto-battlefield", who: "you" },
          then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        },
        returnText:
          "Return that card to the battlefield under its owner's control. If it entered under your control, put a +1/+1 counter on Phelia.",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
