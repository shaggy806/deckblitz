import { defineCard } from "../define.js";

// Rulings:
//   [2021-09-24] If a triggered ability triggers whenever day becomes night or night becomes day,
//     it only triggers if it was already either day/night and becomes the other.
//   [2021-09-24] If you choose to draw a card with The Celestus but some effect replaces that card
//     draw with something else, you will still have to discard a card.

export default defineCard({
  name: "The Celestus",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  becomesDayAsEnters: true,
  text: "If it's neither day nor night, it becomes day as The Celestus enters.\n{T}: Add one mana of any color.\n{3}, {T}: If it's night, it becomes day. Otherwise, it becomes night. Activate only as a sorcery.\nWhenever day becomes night or night becomes day, you gain 1 life. You may draw a card. If you do, discard a card.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "day-night", is: "night" },
        then: { kind: "day-night", value: "day" },
        else: { kind: "day-night", value: "night" },
      },
      resolve: null,
      text: "{3}, {T}: If it's night, it becomes day. Otherwise, it becomes night. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "day-night-changes" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          {
            kind: "may",
            prompt: "Draw a card, then discard a card?",
            // The discard follows the choice to draw, even if the draw is replaced (ruling).
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                { kind: "discard", target: "you", amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "Whenever day becomes night or night becomes day, you gain 1 life. You may draw a card. If you do, discard a card.",
    },
  ],
});
