import { defineCard } from "../define.js";

// One choice over the revealed hand and the graveyard, nonland in both, a card
// exiled if any may be.
export default defineCard({
  name: "Memory Leak",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  cycling: { cost: "{1}" },
  text: "Target opponent reveals their hand. You choose a nonland card from that player's graveyard or hand and exile it.\nCycling {1} ({1}, Discard this card: Draw a card.)",
  targets: ["opponent"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    filter: { notTypes: ["land"] },
    destination: "exile",
    alsoFrom: { zone: "graveyard", filter: { notTypes: ["land"] } },
  },
});
