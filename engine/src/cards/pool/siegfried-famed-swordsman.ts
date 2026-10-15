import { defineCard } from "../define.js";

// EDHREC rank 7388. Final Fantasy.
//
// Rulings:
//   [2025-06-06] The value of X is calculated only once, as Siegfried's last ability resolves.
//
// X is read after the mill, as the step after it applies: the cards just
// milled count.
const ENTER_TEXT =
  "When Siegfried enters, mill three cards. Then put X +1/+1 counters on Siegfried, where X is twice the number of creature cards in your graveyard.";

export default defineCard({
  name: "Siegfried, Famed Swordsman",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { product: [2, { countInGraveyard: { type: "creature", ownedBy: "you" } }] },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
