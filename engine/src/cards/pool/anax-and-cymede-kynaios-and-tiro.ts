import { defineCard } from "../define.js";

const HEROIC_TEXT =
  "Heroic — Whenever you cast a spell that targets Anax and Cymede & Kynaios and Tiro, draw a card. Each player may put a land card from their hand onto the battlefield, then each opponent who didn't draws a card.";

export default defineCard({
  name: "Anax and Cymede & Kynaios and Tiro",
  manaCost: "{1}{R}{G}{W}{U}",
  colors: ["W", "U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 8,
  keywords: ["first-strike", "vigilance"],
  text: `First strike, vigilance\n${HEROIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "each-player-may",
            who: "each-player",
            options: [
              { putFromHand: { type: "land" }, text: "Put a land card from your hand onto the battlefield" },
            ],
            ifDidnt: { kind: "draw", amount: 1, who: "that-player" },
            resultsFor: "each-opponent",
          },
        ],
      },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
});
