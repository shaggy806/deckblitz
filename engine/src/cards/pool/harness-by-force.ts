import { defineCard } from "../define.js";

// Strive is `costPerExtraTarget`; each target is stolen, untapped and
// given haste in turn.
export default defineCard({
  name: "Harness by Force",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Strive — This spell costs {2}{R} more to cast for each target beyond the first.\n" +
    "Gain control of any number of target creatures until end of turn. Untap those creatures. They gain haste until end of turn.",
  costPerExtraTarget: "{2}{R}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gain-control", target: 0, untilEndOfTurn: true },
        { kind: "untap", target: 0 },
        { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      ],
    },
  },
});
