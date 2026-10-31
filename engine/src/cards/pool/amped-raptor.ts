import { defineCard } from "../define.js";

// Modern Horizons 3. The exiled card is cast as the trigger resolves, or not
// at all, its type's timing ignored; the energy is a `cast-now`'s
// `byPayingEnergy` — that card's mana value in {E}, an alternative cost, so
// X is 0 and additional costs may still be paid (the rulings). A land
// exiled on the way, and the card if it isn't cast, stay in exile.
const ENTERS_TEXT =
  "When this creature enters, you get {E}{E} (two energy counters). Then if you cast it from your hand, exile cards from the top of your library until you exile a nonland card. You may cast that card by paying an amount of {E} equal to its mana value rather than paying its mana cost.";

export default defineCard({
  name: "Amped Raptor",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "get-energy", amount: 2 },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
            then: {
              kind: "reveal-until",
              filter: { notTypes: ["land"] },
              exile: true,
              rest: "stay",
              then: { kind: "cast-now", target: 0, byPayingEnergy: true },
            },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
