import { defineCard } from "../define.js";

// EDHREC rank 23801.
//
// One or two different targets (Archenemy's Charm's shape), returned
// together.
const CREATURE_CARD = { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } as const;

export default defineCard({
  name: "Infernal Rebirth",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Return one or two target creature cards from your graveyard to your hand.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  targets: [CREATURE_CARD, { kind: "optional", of: { kind: "other", of: CREATURE_CARD, than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});
