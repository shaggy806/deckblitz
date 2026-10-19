import { defineCard } from "../define.js";

// EDHREC rank 8538.

export default defineCard({
  name: "From the Catacombs",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Put target creature card from a graveyard onto the battlefield under your control with a corpse counter on it. You take the initiative. If that creature would leave the battlefield, exile it instead of putting it anywhere else.\nEscape—{3}{B}{B}, Exile five other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "put-onto-battlefield",
        target: 0,
        underYourControl: true,
        withCounters: { kind: "corpse", amount: 1 },
        exileIfItWouldLeave: true,
      },
      { kind: "take-initiative" },
    ],
  },
  escape: { cost: "{3}{B}{B}", exileCount: 5 },
});
