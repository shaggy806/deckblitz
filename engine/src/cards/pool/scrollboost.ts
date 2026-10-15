import { defineCard } from "../define.js";

// Spiritcall Enthusiast's prepare spell (rule 722): no card of its own.
// "One or two target creatures" is Opera Love Song's pair of slots, the
// second optional and another creature.

export default defineCard({
  name: "Scrollboost",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "One or two target creatures each get +2/+2 until end of turn.",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
    ],
  },
  prepareSpellOnly: true,
});
