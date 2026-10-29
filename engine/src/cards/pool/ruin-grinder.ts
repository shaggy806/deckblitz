import { defineCard } from "../define.js";

// EDHREC rank 5042.

export default defineCard({
  name: "Ruin Grinder",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 7,
  toughness: 4,
  keywords: ["menace"],
  cycling: { cost: "{2}", search: { subtype: "Mountain" } },
  text: "Menace\nWhen this creature dies, each player may discard their hand and draw seven cards.\nMountaincycling {2} ({2}, Discard this card: Search your library for a Mountain card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // Everyone decides in turn order from the active player, then all who chose to discard and draw
      // together (the ruling).
      effect: {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Discard your hand and draw seven cards?",
        effect: { kind: "sequence", effects: [{ kind: "discard-hand", who: "you" }, { kind: "draw", amount: 7 }] },
      },
      resolve: null,
      text: "When this creature dies, each player may discard their hand and draw seven cards.",
    },
  ],
});
