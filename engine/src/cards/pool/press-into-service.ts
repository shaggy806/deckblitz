import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Rulings:
//   [2016-01-22] You can't put more than one +1/+1 counter on any one target using the support
//     action.
//   [2016-01-22] The last target of Press into Service can be any creature, even one that's
//     untapped, one you already control, or one targeted by the support part of the spell.
//   [2016-01-22] Support can target a creature you don't control.

export default defineCard({
  name: "Press into Service",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Support 2. (Put a +1/+1 counter on each of up to two target creatures.)\nGain control of target creature until end of turn. Untap that creature. It gains haste until end of turn.",
  // Slots 0–1: support's "up to two target creatures" (rule 701.41a — no
  // "other" on an instant or sorcery); slot 2: the creature to steal, which
  // may be one of them (the ruling).
  targets: [...distinctTargets(2, "creature", { optional: true }), "creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
      { kind: "gain-control", target: 2, untilEndOfTurn: true },
      { kind: "untap", target: 2 },
      { kind: "grant-keyword", target: 2, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
