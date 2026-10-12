import { defineCard } from "../define.js";

// EDHREC rank 18347. Marvel Super Heroes Commander.
//
// Undead Butler's shape: "you may exile this card. When you do" — the
// reflexive trigger targets only once the card is exiled, so Doombot
// Harbinger itself can't be the card returned.
const ENTER_TEXT = "When this creature enters, you may mill four cards.";
const DIES_TEXT =
  "When this creature dies, you may exile this card. When you do, return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Doombot Harbinger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT} (You may put the top four cards of your library into your graveyard.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Mill four cards?",
        effect: { kind: "mill", target: "you", amount: 4 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Doombot Harbinger?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "reflexive-trigger",
                targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
                effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
                text: "When you do, return target creature card from your graveyard to your hand.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
