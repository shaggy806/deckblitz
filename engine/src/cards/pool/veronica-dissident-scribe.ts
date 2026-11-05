import { defineCard } from "../define.js";

const ATTACK = "Whenever Veronica attacks, you may discard a card. If you do, draw a card.";
const DISCARD =
  "Whenever you discard one or more nonland cards for the first time each turn, create a Junk token. (It's an artifact with \"{T}, Sacrifice this token: Exile the top card of your library. You may play that card this turn. Activate only as a sorcery.\")";

export default defineCard({
  name: "Veronica, Dissident Scribe",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${ATTACK}\n${DISCARD}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK,
    },
    {
      trigger: { on: "discards", who: "you", filter: { notTypes: ["land"] }, firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "create-token", token: "Junk Token", count: 1 },
      resolve: null,
      text: DISCARD,
    },
  ],
});
