import { defineCard } from "../define.js";

// EDHREC rank 13050.
// Makes Forest Tentacle → "Forest Tentacle Token".
//
// Rulings:
//   [2026-08-21] Even though it has the land type Forest, the land created isn't a basic land.

const UPKEEP_TEXT =
  "At the beginning of each player's upkeep, you create a 3/3 green Forest Tentacle land creature token. (It has \"{T}: Add {G}.\" It's affected by summoning sickness until your next turn.)";

export default defineCard({
  name: "Verdant Kraken",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Kraken"],
  power: 6,
  toughness: 6,
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      // "You create": the token is the Kraken's controller's, whoever's
      // upkeep it is.
      effect: { kind: "create-token", token: "Forest Tentacle Token", count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
