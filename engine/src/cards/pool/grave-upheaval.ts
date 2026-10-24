import { defineCard } from "../define.js";

// Commander 2016 (C16). EDHREC rank 14922.
//
// Puppeteer Clique's reanimation: "it gains haste" has no duration, so the
// grant lasts for as long as the permanent does.
const SPELL = "Put target creature card from a graveyard onto the battlefield under your control. It gains haste.";

export default defineCard({
  name: "Grave Upheaval",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: `${SPELL}\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)`,
  targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
    ],
  },
});
