import { defineCard } from "../define.js";

// Darksteel. EDHREC rank 26454. "An opponent controls more creatures than
// you" is Garruk, Unleashed's `opponent-controls-more`, read after the token
// is made (it counts on your side); the spell returns itself from the stack
// as Revive the Fallen does.

export default defineCard({
  name: "Pulse of the Tangle",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 3/3 green Beast creature token. Then if an opponent controls more creatures than you, return Pulse of the Tangle to its owner's hand.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "3/3 Beast Token", count: 1 },
      {
        kind: "conditional",
        condition: { kind: "opponent-controls-more", filter: { type: "creature" } },
        then: { kind: "return-to-hand", target: "source", from: "stack" },
      },
    ],
  },
});
