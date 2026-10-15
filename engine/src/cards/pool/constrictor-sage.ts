import { defineCard } from "../define.js";

// EDHREC rank 21529.
//
// Rulings:
//   [2025-04-04] If a card with a renew ability is put into your graveyard during your turn, you
//     can activate that ability if it’s legal to do so before any other player can take any
//     actions.

const ENTER_TEXT =
  "When this creature enters, tap target creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";
const RENEW_TEXT =
  "Renew — {2}{U}, Exile this card from your graveyard: Tap target creature an opponent controls and put a stun counter on it. Activate only as a sorcery.";

export default defineCard({
  name: "Constrictor Sage",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Wizard"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${RENEW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      zone: "graveyard",
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: RENEW_TEXT,
      sorcerySpeed: true,
    },
  ],
});
