import { defineCard } from "../define.js";

// X different cards picked at random from your graveyard as it resolves, all
// returned together; then it exiles itself.
export default defineCard({
  name: "Reap the Past",
  manaCost: "{X}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  exileOnResolve: true,
  text: "Return X cards at random from your graveyard to your hand. Exile Reap the Past.",
  targets: [],
  effect: {
    kind: "choose-random-card",
    zone: "graveyard",
    count: "x",
    then: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "return-to-hand", target: 0, from: "graveyard" } },
  },
});
