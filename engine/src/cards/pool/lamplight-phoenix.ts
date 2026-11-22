import { defineCard } from "../define.js";

// Murders at Karlov Manor (MKM). EDHREC rank 19133.
//
// Rulings:
//   You can't exile Lamplight Phoenix from your graveyard to pay the collect
//   evidence cost of its triggered ability.
//   If you can't exile enough cards to meet or exceed the required mana value,
//   you can't choose to collect evidence at all.

const DIES_TEXT =
  "When this creature dies, you may exile it and collect evidence 4. If you do, return this card to the battlefield tapped. (To collect evidence 4, exile cards with total mana value 4 or greater from your graveyard.)";

export default defineCard({
  name: "Lamplight Phoenix",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // One action, both or neither: offered only while the card is still in
      // the graveyard and the rest of it holds 4 (`exiling`); the card, now
      // in exile, is the `then`'s target 0.
      effect: {
        kind: "may",
        prompt: "Exile Lamplight Phoenix and collect evidence 4 to return it to the battlefield tapped?",
        effect: {
          kind: "collect-evidence",
          amount: 4,
          exiling: "trigger-object",
          then: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
