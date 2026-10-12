import { defineCard } from "../define.js";

// Jadzi, Steward of Fate's prepare spell (rule 722): no card of its own, only
// ever cast as the copy a prepared Jadzi makes in exile (722.3c). "Each
// Fractal you control" is every one, the tokens just made among them —
// counted as the counters go on, after the tokens have entered.
export default defineCard({
  name: "Oracle's Gift",
  manaCost: "{X}{X}{U}",
  colors: ["U"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Create X 0/0 green and blue Fractal creature tokens, then put X +1/+1 counters on each Fractal you control.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Fractal Token", count: "x" },
      { kind: "add-counter-all", filter: { subtype: "Fractal", controlledBy: "you" }, counter: "+1/+1", amount: "x" },
    ],
  },
});
