import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 12487. "Whenever you sacrifice a Clue" is any Clue, for any
// reason (the rulings) — Graf Mole's trigger.
const ENTERS = "When this creature enters, investigate.";
const POISON = "Whenever you sacrifice a Clue, target opponent gets two poison counters.";

export default defineCard({
  name: "Persuasive Interrogators",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon", "Detective"],
  power: 5,
  toughness: 6,
  text: `${ENTERS} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${POISON} (A player with ten or more poison counters loses the game.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Clue" } },
      targets: ["opponent"],
      effect: { kind: "add-player-counters", counter: "poison", amount: 2, target: 0 },
      resolve: null,
      text: POISON,
    },
  ],
});
