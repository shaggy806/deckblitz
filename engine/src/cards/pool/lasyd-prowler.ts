import { defineCard } from "../define.js";

// EDHREC rank 11224.
//
// Rulings:
//   [2025-04-04] The value of X is calculated only once, as Lasyd Prowler’s renew ability
//     resolves.
//   [2025-04-04] If you don’t have at least as many cards in your library as lands you control
//     when Lasyd Prowler’s first ability resolves, you can’t choose to mill that many cards.
//   [2025-04-04] If a card with a renew ability is put into your graveyard during your turn, you
//     can activate that ability if it’s legal to do so before any other player can take any
//     actions.

const MILL_TEXT = "When this creature enters, you may mill cards equal to the number of lands you control.";
const RENEW_TEXT =
  "Renew — {1}{G}, Exile this card from your graveyard: Put X +1/+1 counters on target creature, where X is the number of land cards in your graveyard. Activate only as a sorcery.";

export default defineCard({
  name: "Lasyd Prowler",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Ranger"],
  power: 5,
  toughness: 5,
  text: `${MILL_TEXT}\n${RENEW_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: ["creature"],
      // X read as it resolves (the ruling); the card itself was exiled to pay.
      effect: {
        kind: "add-counter",
        target: 0,
        counter: "+1/+1",
        amount: { countInGraveyard: { type: "land", ownedBy: "you" } },
      },
      resolve: null,
      text: RENEW_TEXT,
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // A `may` mill is offered only when the library holds that many (rule
      // 701.17b, the ruling).
      effect: {
        kind: "may",
        prompt: "Mill cards equal to the number of lands you control?",
        effect: { kind: "mill", target: "you", amount: { countOf: { type: "land", controlledBy: "you" } } },
      },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
