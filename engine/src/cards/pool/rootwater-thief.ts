import { defineCard } from "../define.js";

// EDHREC rank 20355. "That player" is the player dealt the damage; "a card",
// a quantity, must be found (rule 701.23d).

export default defineCard({
  name: "Rootwater Thief",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 1,
  toughness: 2,
  text: "{U}: This creature gains flying until end of turn.\nWhenever this creature deals combat damage to a player, you may pay {2}. If you do, search that player's library for a card and exile it, then the player shuffles.",
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{U}: This creature gains flying until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to search that player's library for a card and exile it?",
        cost: "{2}",
        effect: {
          kind: "search-library",
          whose: "trigger-player",
          filter: {},
          destination: "exile",
          min: 1,
          max: 1,
        },
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, you may pay {2}. If you do, search that player's library for a card and exile it, then the player shuffles.",
    },
  ],
});
