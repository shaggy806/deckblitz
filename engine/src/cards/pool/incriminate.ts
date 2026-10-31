import { defineCard } from "../define.js";

// Two targets one player controls (`sameController`); as it resolves, that
// player picks which of the still-legal ones is sacrificed
// (`choose-among-targets`) — with only one still legal, that one, unasked
// (the rulings). A sacrifice, so indestructible doesn't help.
export default defineCard({
  name: "Incriminate",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose two target creatures controlled by the same player. That player sacrifices one of them of their choice.",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 }, sameController: true }],
  effect: {
    kind: "choose-among-targets",
    chooser: "their-controller",
    count: 1,
    prompt: "Choose the creature you sacrifice",
    chosen: { effect: { kind: "sacrifice-target", target: 0, byItsController: true } },
  },
});
