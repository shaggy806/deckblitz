import { defineCard } from "../define.js";

// EDHREC rank 12537.
// Checked as attackers and blockers are declared: one already in combat
// stays there if delirium is lost (the ruling).
const DELIRIUM =
  "Delirium — This creature can't attack or block unless there are four or more card types among cards in your graveyard.";
const MILL = "At the beginning of your upkeep, you may mill a card. (You may put the top card of your library into your graveyard.)";

export default defineCard({
  name: "Patchwork Beastie",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: `${DELIRIUM}\n${MILL}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "delirium" } },
      restrictions: ["cant-attack", "cant-block"],
      text: DELIRIUM,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "may", prompt: "Mill a card?", effect: { kind: "mill", target: "you", amount: 1 } },
      resolve: null,
      text: MILL,
    },
  ],
});
