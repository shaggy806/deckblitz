import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 31888.
//
// The opponent's draw is theirs to take (Risk Factor's `controllerOfTarget`
// on a player slot): "you" in the `each-player-may` effect is them.

const TEXT =
  "{W}, {T}: Prevent the next 2 damage that would be dealt to target creature this turn. Target opponent may draw a card.";

export default defineCard({
  name: "Soldevi Heretic",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["creature", "opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "prevent-damage", target: 0, amount: 2 },
          {
            kind: "each-player-may",
            who: { controllerOfTarget: 1 },
            prompt: "Draw a card?",
            effect: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
