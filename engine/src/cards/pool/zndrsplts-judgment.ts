import { defineCard } from "../define.js";

// Each friend, then each foe, chooses one of their own creatures as this
// resolves (as-player: the choice is theirs).
export default defineCard({
  name: "Zndrsplt's Judgment",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text:
    "For each player, choose friend or foe. Each friend creates a token that's a copy of a creature they control. Each foe returns a creature they control to its owner's hand.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, who: "you", for: { options: ["friend", "foe"], about: "each-player" } },
      {
        kind: "for-each-player",
        who: "each-friend",
        effect: {
          kind: "as-player",
          who: "that-player",
          effect: {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            min: 1,
            upTo: 1,
            prompt: "Choose a creature you control to copy",
            then: { kind: "create-token-copy", of: 0, count: 1 },
          },
        },
      },
      {
        kind: "for-each-player",
        who: "each-foe",
        effect: {
          kind: "as-player",
          who: "that-player",
          effect: {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            min: 1,
            upTo: 1,
            prompt: "Choose a creature you control to return to its owner's hand",
            then: { kind: "return-to-hand", target: 0 },
          },
        },
      },
    ],
  },
});
