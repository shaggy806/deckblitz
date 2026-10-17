import { defineCard } from "../define.js";

const GRAVEYARD_TEXT =
  "Whenever you scry, if you control an Island, you may exile this card from your graveyard. If you do, draw a card.";

export default defineCard({
  name: "Council's Deliberation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Draw a card.\n${GRAVEYARD_TEXT}`,
  targets: [],
  effect: { kind: "draw", amount: 1 },
  triggered: [
    {
      // Works only from the graveyard (rule 113.6k: it moves its own card
      // out of that zone); the intervening "if" is asked again as it
      // resolves (rule 603.4).
      fromGraveyard: true,
      trigger: { on: "scries", who: "you" },
      condition: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Council's Deliberation from your graveyard to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "source" },
            { kind: "conditional", condition: { kind: "this-way", what: "exiled" }, then: { kind: "draw", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: GRAVEYARD_TEXT,
    },
  ],
});
