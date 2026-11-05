import { defineCard } from "../define.js";

export default defineCard({
  name: "Doppelgang",
  manaCost: "{X}{X}{X}{G}{U}",
  colors: ["G", "U"],
  types: ["sorcery"],
  text: "For each of X target permanents, create X tokens that are copies of that permanent.",
  targets: [{ kind: "any-number", of: "permanent", min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "create-token-copy", of: 0, count: "x", who: "you" },
  },
});
