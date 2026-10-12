import { defineCard } from "../define.js";

export default defineCard({
  name: "Broodbirth Viper",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 3,
  toughness: 3,
  text: "Myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)\nWhenever this creature deals combat damage to a player, you may draw a card.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-other-opponent",
        effect: {
          kind: "may",
          prompt: "Myriad: create a token copy attacking this player?",
          aboutThatPlayer: true,
          effect: {
            kind: "create-token-copy",
            of: "source",
            count: 1,
            tapped: true,
            attacking: { player: "that-player", orTheirPlaneswalker: true },
            exileAtEndOfCombat: true,
          },
        },
      },
      resolve: null,
      text: "Myriad",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, you may draw a card.",
    },
  ],
});
