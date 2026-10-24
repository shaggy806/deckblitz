import { defineCard } from "../define.js";

// EDHREC rank 14087. It triggers at every end step; whether a player other
// than Ludevic's controller lost life this turn is checked only as it
// resolves (the ruling), so it's a `conditional`, not an intervening if.
// Every other player is an opponent; `turnOrder` keeps a player who has
// since lost the game, who still counts (the ruling). The draw is the active
// player's choice and their own draw.
const TEXT =
  "At the beginning of each player's end step, that player may draw a card if a player other than you lost life this turn.";

export default defineCard({
  name: "Ludevic, Necro-Alchemist",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 4,
  pairing: { kind: "partner" },
  text: `${TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
        then: {
          kind: "each-player-may",
          who: "active-player",
          prompt: "Draw a card?",
          effect: { kind: "draw", amount: 1 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
