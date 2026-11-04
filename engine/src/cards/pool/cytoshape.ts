import { defineCard } from "../define.js";

// Only the creature becoming a copy is targeted; the one it copies is chosen as
// this resolves (the ruling), and may be the target.
export default defineCard({
  name: "Cytoshape",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  types: ["instant"],
  text: "Choose a nonlegendary creature on the battlefield. Target creature becomes a copy of that creature until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "choose-permanents",
    filter: { type: "creature", notSupertype: "legendary" },
    min: 1,
    upTo: 1,
    keepTargets: true,
    then: { kind: "become-copy", target: 1, of: 0, until: "end-of-turn" },
    prompt: "Choose a nonlegendary creature on the battlefield.",
  },
});
