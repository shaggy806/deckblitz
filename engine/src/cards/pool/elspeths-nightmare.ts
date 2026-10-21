import { defineCard } from "../define.js";

// EDHREC rank 12242.

export default defineCard({
  name: "Elspeth's Nightmare",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — Destroy target creature an opponent controls with power 2 or less.\nII — Target opponent reveals their hand. You choose a noncreature, nonland card from it. That player discards that card.\nIII — Exile target opponent's graveyard.",
  chapters: [
    {
      at: [1],
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "I — Destroy target creature an opponent controls with power 2 or less.",
    },
    {
      at: [2],
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["creature", "land"] } },
      resolve: null,
      text: "II — Target opponent reveals their hand. You choose a noncreature, nonland card from it. That player discards that card.",
    },
    {
      at: [3],
      targets: ["opponent"],
      effect: { kind: "exile-graveyard", target: 0 },
      resolve: null,
      text: "III — Exile target opponent's graveyard.",
    },
  ],
});
