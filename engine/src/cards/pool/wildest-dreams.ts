import { defineCard } from "../define.js";

// EDHREC rank 9797. Exactly X targets, X announced first (rule 601.2b–c);
// they return together, one instruction. Exiled only as it resolves: with
// every target gone it doesn't resolve and goes to the graveyard (the
// ruling, rule 608.2b).
export default defineCard({
  name: "Wildest Dreams",
  manaCost: "{X}{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return X target cards from your graveyard to your hand. Exile Wildest Dreams.",
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" }, min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  },
  exileOnResolve: true,
});
