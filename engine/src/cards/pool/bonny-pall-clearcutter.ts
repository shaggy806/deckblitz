import { defineCard } from "../define.js";

// EDHREC rank 3527. One choice of a land card across the hand and the
// graveyard (`from: "hand-or-graveyard"`, Riveteers Confluence's shape);
// putting it onto the battlefield isn't playing it (the ruling).

const ATTACK_TEXT = "Whenever you attack, draw a card, then you may put a land card from your hand or graveyard onto the battlefield.";

export default defineCard({
  name: "Bonny Pall, Clearcutter",
  manaCost: "{3}{G}{U}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Scout"],
  power: 6,
  toughness: 5,
  keywords: ["reach"],
  text: `Reach\nWhen Bonny Pall enters, create Beau, a legendary blue Ox creature token with "Beau's power and toughness are each equal to the number of lands you control."\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Beau Token", count: 1 },
      resolve: null,
      text: "When Bonny Pall enters, create Beau, a legendary blue Ox creature token with \"Beau's power and toughness are each equal to the number of lands you control.\"",
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "may",
            prompt: "Put a land card from your hand or graveyard onto the battlefield?",
            effect: {
              kind: "return-from-graveyard",
              filter: { type: "land" },
              destination: "battlefield",
              count: 1,
              from: "hand-or-graveyard",
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
