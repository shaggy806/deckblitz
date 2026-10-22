import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 6891.
//
// The defending player is the unblocked trigger's trigger player, and the
// amount is their own graveyard's size as it resolves.

const TEXT =
  "Whenever this creature attacks and isn't blocked, defending player loses 1 life for each card in their graveyard.";

export default defineCard({
  name: "Guiltfeeder",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 0,
  toughness: 4,
  keywords: ["fear"],
  text: `Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: { graveyardSize: "each" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
