import { defineCard } from "../define.js";

// Exactly X targets (Curse of the Swine's `min`/`max: "x"`), returned as one
// event. With every target illegal the spell doesn't resolve, so it goes to
// the graveyard rather than exile (the ruling).
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
