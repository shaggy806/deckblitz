import { defineCard } from "../define.js";

// The creature is chosen at random, not targeted (shroud and hexproof don't
// stop it), and nothing happens between the choice and the rest (the
// rulings): one resolution, the chosen creature at slot 0.
export default defineCard({
  name: "The Nipton Lottery",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Choose a creature at random. You gain control of that creature until end of turn. Untap it. It gains haste until end of turn. Then destroy all other creatures.",
  targets: [],
  effect: {
    kind: "choose-permanents",
    random: true,
    filter: { type: "creature" },
    upTo: 1,
    prompt: "A creature, at random",
    then: {
      kind: "sequence",
      effects: [
        { kind: "gain-control", target: 0, untilEndOfTurn: true },
        { kind: "untap", target: 0 },
        { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        {
          kind: "for-each-permanent",
          filter: { type: "creature" },
          as: 1,
          exceptTarget: 0,
          simultaneous: true,
          effect: { kind: "destroy", target: 1 },
        },
      ],
    },
  },
});
