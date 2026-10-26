import { defineCard } from "../define.js";

// Shards of Alara (ALA). EDHREC rank 24913. Mental Journey's landcycling.

export default defineCard({
  name: "Sylvan Bounty",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["instant"],
  cycling: { cost: "{1}{G}", search: { supertype: "basic", type: "land" } },
  text: "Target player gains 8 life.\nBasic landcycling {1}{G} ({1}{G}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: ["player"],
  effect: { kind: "gain-life", amount: 8, toControllerOfTarget: 0 },
});
