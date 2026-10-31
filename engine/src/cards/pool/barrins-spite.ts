import { defineCard } from "../define.js";

// Two targets one player controls (`sameController`): their controller picks
// the one sacrificed and the other returns to its owner's hand
// (`choose-among-targets`). With only one still legal as it resolves, that
// one is sacrificed and nothing returns (the rulings).
export default defineCard({
  name: "Barrin's Spite",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Choose two target creatures controlled by the same player. Their controller chooses and sacrifices one of them. Return the other to its owner's hand.",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 }, sameController: true }],
  effect: {
    kind: "choose-among-targets",
    chooser: "their-controller",
    count: 1,
    prompt: "Choose the creature you sacrifice — the other returns to its owner's hand",
    chosen: { effect: { kind: "sacrifice-target", target: 0, byItsController: true } },
    rest: "hand",
  },
});
