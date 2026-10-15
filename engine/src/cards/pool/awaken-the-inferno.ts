import { defineCard } from "../define.js";

// EDHREC rank 28407.

export default defineCard({
  name: "Awaken the Inferno",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Awaken the Inferno deals 6 damage to target creature or planeswalker an opponent controls. Put a +1/+1 counter on up to one target creature you control.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: [
    {
      kind: "permanent",
      whose: "opponent",
      filter: { typesAnyOf: ["creature", "planeswalker"] },
    },
    { kind: "optional", of: "creature-you-control" },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});
