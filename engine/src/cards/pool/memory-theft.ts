import { defineCard } from "../define.js";

// "A card that has an Adventure that player owns from exile": a
// `look-and-choose` over the exile zone with `from` (the target opponent's
// cards) and `hasAdventure`, which a face-down card never has (rule 406.3a).

export default defineCard({
  name: "Memory Theft",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. You may put a card that has an Adventure that player owns from exile into that player's graveyard.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      {
        kind: "look-and-choose",
        zone: "exile",
        from: { target: 0 },
        filter: { hasAdventure: true },
        min: 0,
        max: 1,
        destination: "graveyard",
        leftover: "stay",
      },
    ],
  },
});
