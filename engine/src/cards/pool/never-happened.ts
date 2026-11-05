import { defineCard } from "../define.js";

// EDHREC rank 26034.

export default defineCard({
  name: "Never Happened",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from that player's graveyard or hand and exile it.",
  targets: ["opponent"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    filter: { notTypes: ["land"] },
    destination: "exile",
    alsoFrom: { zone: "graveyard", filter: { notTypes: ["land"] } },
  },
});
