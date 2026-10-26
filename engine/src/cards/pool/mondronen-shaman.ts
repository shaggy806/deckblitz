import { defineCard } from "../define.js";

// EDHREC rank 14370.
//
// Rulings:
//   [2011-01-22] Tovolar's Magehunter's first triggered ability will resolve before the spell that
//     caused it to trigger. If this causes the player who cast that spell to lose the game, that
//     spell won't resolve.

export default defineCard({
  name: "Mondronen Shaman",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman", "Werewolf"],
  power: 3,
  toughness: 2,
  text: "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", none: true },
    },
  ],
  faces: ["Mondronen Shaman", "Tovolar's Magehunter"],
  transform: true,
});
