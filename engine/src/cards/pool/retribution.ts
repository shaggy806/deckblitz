import { defineCard } from "../define.js";

// Two targets one opponent controls (`sameController`): that player picks
// the one sacrificed and the other gets a -1/-1 counter
// (`choose-among-targets`). With only one still legal as it resolves, that
// one is sacrificed.
export default defineCard({
  name: "Retribution",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose two target creatures controlled by the same opponent. That player chooses and sacrifices one of those creatures. Put a -1/-1 counter on the other.",
  targets: [
    "creature-an-opponent-controls",
    { kind: "other", of: "creature-an-opponent-controls", than: { slot: 0 }, sameController: true },
  ],
  effect: {
    kind: "choose-among-targets",
    chooser: "their-controller",
    count: 1,
    prompt: "Choose the creature you sacrifice — the other gets a -1/-1 counter",
    chosen: { effect: { kind: "sacrifice-target", target: 0, byItsController: true } },
    rest: { effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 } },
  },
});
