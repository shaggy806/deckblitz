import { defineCard } from "../define.js";

// EDHREC rank 26565.
// Ruling: the last ability triggers only while this card is in your graveyard.

export default defineCard({
  name: "Erebos's Titan",
  manaCost: "{1}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 5,
  text: "As long as your opponents control no creatures, this creature has indestructible. (Damage and effects that say \"destroy\" don't destroy it.)\nWhenever a creature card leaves an opponent's graveyard, you may discard a card. If you do, return this card from your graveyard to your hand.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "opponents-control-total", filter: { type: "creature" }, atLeast: 1 } },
      grantKeywords: ["indestructible"],
      text: "As long as your opponents control no creatures, this creature has indestructible.",
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "leaves-graveyard", who: "opponent", perCard: true, filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to return Erebos's Titan to your hand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "return-to-hand", target: "source", from: "graveyard" },
            },
          ],
        },
      },
      resolve: null,
      text: "Whenever a creature card leaves an opponent's graveyard, you may discard a card. If you do, return this card from your graveyard to your hand.",
    },
  ],
});
