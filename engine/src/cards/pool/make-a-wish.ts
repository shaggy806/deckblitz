import { defineCard } from "../define.js";

// "Two cards at random": two different cards, each pair equally likely,
// returned together. With one card there, that one (the ruling).
export default defineCard({
  name: "Make a Wish",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return two cards at random from your graveyard to your hand.",
  targets: [],
  effect: {
    kind: "choose-random-card",
    zone: "graveyard",
    count: 2,
    then: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "return-to-hand", target: 0, from: "graveyard" } },
  },
});
