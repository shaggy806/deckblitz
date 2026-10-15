import { defineCard } from "../define.js";

// EDHREC rank 11054. The front face of a transforming card (Ashling,
// Rekindled's "you may pay … If you do, transform" shape).
//
// "You may pay {4}{U}{U}{B}{B} and exile eight cards from your graveyard" is
// one cost: offered only with eight or more cards in that graveyard (a cost
// that can't be paid in full can't be paid at all, rule 118.3), the mana paid
// as the choice is answered and the eight cards — the player's pick — exiled
// at once; only then, "if you do", does Ultimecia transform. She won't if she
// has transformed since the trigger (rule 701.28f).
const SURVEIL_TEXT =
  "Whenever Ultimecia enters or attacks, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)";
const TRANSFORM_TEXT =
  "At the beginning of your end step, you may pay {4}{U}{U}{B}{B} and exile eight cards from your graveyard. If you do, transform Ultimecia.";

export default defineCard({
  name: "Ultimecia, Time Sorceress",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 4,
  toughness: 5,
  text: `${SURVEIL_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 8 },
        then: {
          kind: "may",
          prompt: "Pay {4}{U}{U}{B}{B} and exile eight cards from your graveyard to transform Ultimecia?",
          cost: "{4}{U}{U}{B}{B}",
          effect: {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 8,
            max: 8,
            destination: "exile",
            leftover: "stay",
          },
          then: { kind: "transform", target: "source" },
        },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Ultimecia, Time Sorceress", "Ultimecia, Omnipotent"],
  transform: true,
});
