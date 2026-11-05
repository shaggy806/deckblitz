import { defineCard } from "../define.js";

// EDHREC rank 25281.

export default defineCard({
  name: "Oracle of Dust",
  manaCost: "{4}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Processor"],
  power: 3,
  toughness: 5,
  text: "Devoid (This card has no color.)\n{2}, Put a card an opponent owns from exile into that player's graveyard: Draw a card, then discard a card.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, putFromExile: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "{2}, Put a card an opponent owns from exile into that player's graveyard: Draw a card, then discard a card.",
    },
  ],
});
