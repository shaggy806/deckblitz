import { defineCard } from "../define.js";

// EDHREC rank 14922. "It gains haste" has no duration: it lasts as long as
// the creature stays on the battlefield.

export default defineCard({
  name: "Grave Upheaval",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Put target creature card from a graveyard onto the battlefield under your control. It gains haste.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
    ],
  },
});
