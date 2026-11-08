import { defineCard } from "../define.js";

// Each opponent, from the active player (rule 101.4), keeps two cards of their own
// graveyard, or all of it with two or fewer there.
const TEXT = "Exile this creature: Each opponent chooses two cards in their graveyard and exiles the rest.";

export default defineCard({
  name: "Watchers of the Dead",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "graveyard",
          min: 2,
          max: 2,
          destination: "stay",
          leftover: "exile",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
