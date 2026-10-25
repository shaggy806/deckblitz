import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 19473.
//
// Guiltfeeder's shape: "attacks and isn't blocked" (rule 509.3g), whose
// trigger player is the defending player.

const TEXT =
  "Whenever this creature attacks and isn't blocked, defending player gets a poison counter. (A player with ten or more poison counters loses the game.)";

export default defineCard({
  name: "Swamp Mosquito",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
