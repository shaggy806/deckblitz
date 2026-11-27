import { defineCard } from "../define.js";

// EDHREC rank 25695. Erratic Explosion's shape with the cards exiled, not put
// back: the found card is target 0 of `then`, the spell's own any-target slot
// one up (`thenKeepsTargets`). Its mana value is read where it was exiled. No
// nonland card (or no library) deals nothing (the ruling). Each upkeep's copy
// (rule 702.50a) may take a new target, and exiles again from the top.

export default defineCard({
  name: "Undying Flames",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Exile cards from the top of your library until you exile a nonland card. Undying Flames deals damage to any target equal to that card's mana value.\nEpic (For the rest of the game, you can't cast spells. At the beginning of each of your upkeeps, copy this spell except for its epic ability. You may choose a new target for the copy.)",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "reveal-until",
        filter: { notTypes: ["land"] },
        exile: true,
        then: { kind: "damage", target: 1, amount: { manaValueOf: 0 } },
        thenKeepsTargets: true,
        rest: "stay",
      },
      { kind: "epic" },
    ],
  },
});
