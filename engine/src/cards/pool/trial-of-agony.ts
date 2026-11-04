import { defineCard } from "../define.js";

// With one target illegal as it resolves, its controller must choose the other,
// which is dealt the 5 damage (the ruling): the choice is among those still legal.
export default defineCard({
  name: "Trial of Agony",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Choose two target creatures controlled by the same opponent. That player chooses one of those creatures. " +
    "Trial of Agony deals 5 damage to that creature, and the other can't block this turn.",
  targets: [
    "creature-an-opponent-controls",
    { kind: "other", of: "creature-an-opponent-controls", than: { slot: 0 }, sameController: true },
  ],
  effect: {
    kind: "choose-among-targets",
    chooser: "their-controller",
    count: 1,
    prompt: "Choose the creature dealt 5 damage — the other can't block this turn",
    chosen: { effect: { kind: "damage", target: 0, amount: 5 } },
    rest: { effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] } },
  },
});
