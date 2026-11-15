import { defineCard } from "../define.js";

// EDHREC rank 21416.

const TEXT =
  'When Q enters, shuffle your library, then exile cards from the top of your library until you exile a nonland card. That nonland card gains "Exile a card from your hand: Create a copy of this card. You may cast the copy. Activate only during your turn and only if this card is exiled."';
const GRANTED_TEXT =
  "Exile a card from your hand: Create a copy of this card. You may cast the copy. Activate only during your turn and only if this card is exiled.";

// The exiled card keeps the ability for as long as it stays in exile (a new
// object once it leaves, rule 400.7); its owner activates it there. The copy
// is made in exile and cast with its costs paid (rule 707.12), or ceases to
// exist.
export default defineCard({
  name: "Q, Stacking the Deck",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Q"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-library" },
          {
            kind: "reveal-until",
            filter: { notTypes: ["land"] },
            exile: true,
            then: {
              kind: "grant-activated",
              target: 0,
              ability: {
                cost: { mana: null, tap: false, exileFromHand: { count: 1 } },
                targets: [],
                zone: "exile",
                condition: { kind: "your-turn" },
                effect: { kind: "cast-now", target: "source", copies: 1 },
                resolve: null,
                text: GRANTED_TEXT,
              },
              duration: "permanent",
            },
            rest: "stay",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
