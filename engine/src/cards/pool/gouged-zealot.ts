import { defineCard } from "../define.js";

// EDHREC rank 28028. Modern Horizons 2.
//
// Delirium is an intervening-if (rule 603.4): checked as it triggers and
// again as it resolves (its ruling). The defending player is the one it
// attacks, or the controller of the planeswalker it attacks.
const TEXT =
  "Delirium — Whenever this creature attacks, if there are four or more card types among cards in your graveyard, this creature deals 1 damage to each creature defending player controls.";

export default defineCard({
  name: "Gouged Zealot",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cyclops", "Berserker"],
  power: 4,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature" }, amount: 1, whose: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
