import { defineCard } from "../define.js";

// EDHREC rank 10893.

export default defineCard({
  name: "Fated Return",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put target creature card from a graveyard onto the battlefield under your control. It gains indestructible. If it's your turn, scry 2.",
  targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      // No duration (ruling): it lasts until the creature leaves the battlefield.
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "permanent" },
      { kind: "conditional", condition: { kind: "your-turn" }, then: { kind: "scry", amount: 2 } },
    ],
  },
});
