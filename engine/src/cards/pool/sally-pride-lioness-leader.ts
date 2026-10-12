import { defineCard } from "../define.js";

// EDHREC rank 12573.
//
// Rulings:
//   [2026-01-27] The value of X is calculated only once, as Sally Pride's first ability resolves.
//
// X counts as the ability resolves, Sally Pride herself included while she's
// still there; the tokens are "Mutant Token" (2/2 red, Slash's).

export default defineCard({
  name: "Sally Pride, Lioness Leader",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Mutant", "Rebel"],
  power: 2,
  toughness: 4,
  text: "When Sally Pride enters, create X 2/2 red Mutant creature tokens, where X is the number of nontoken creatures you control.\nWhenever Sally Pride attacks, put a +1/+1 counter on each creature you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Mutant Token",
        count: { countOf: { type: "creature", controlledBy: "you", token: false } },
      },
      resolve: null,
      text: "When Sally Pride enters, create X 2/2 red Mutant creature tokens, where X is the number of nontoken creatures you control.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "Whenever Sally Pride attacks, put a +1/+1 counter on each creature you control.",
    },
  ],
});
