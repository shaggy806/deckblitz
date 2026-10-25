import { defineCard } from "../define.js";

// EDHREC rank 25627.

export default defineCard({
  name: "Whispers of Emrakul",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards a card at random.\nDelirium — If there are four or more card types among cards in your graveyard, that player discards two cards at random instead.",
  targets: ["opponent"],
  effect: {
    kind: "conditional",
    condition: { kind: "delirium" },
    then: { kind: "discard", target: 0, amount: 2, random: true },
    else: { kind: "discard", target: 0, amount: 1, random: true },
  },
});
