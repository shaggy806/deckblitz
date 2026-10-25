import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 16572. Redtooth Vanguard's shape: a trigger
// that works only from the graveyard, whose "you may pay {R}. If you do" is a
// `may` with a cost.

const RETURN_TEXT =
  "Whenever an opponent gains life, you may pay {R}. If you do, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Punishing Fire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Punishing Fire deals 2 damage to any target.\n${RETURN_TEXT}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "gains-life", who: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R} to return Punishing Fire to your hand?",
        cost: "{R}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
