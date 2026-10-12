import { defineCard } from "../define.js";

// EDHREC rank 19417.
//
// "You may behold a Gamma creature" is an optional additional cost (rule
// 601.2b), a kicker by another name — a Gamma creature card from the hand or
// a Gamma creature you control (701.4a). "If this spell's additional cost was
// paid" is the kicked cast (607.2i), which has a third target, chosen only
// then: a "noncreature artifact or noncreature enchantment" is an artifact or
// enchantment that isn't a creature. Cosmic Hunger's one-sided fight, the
// second target "another" than the first.

export default defineCard({
  name: "Hulk's Thunderclap",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, you may behold a Gamma creature. (You may choose a Gamma creature you control or reveal a Gamma creature card from your hand.)\nTarget creature you control deals damage equal to its power to another target creature. If this spell's additional cost was paid, destroy target noncreature artifact or noncreature enchantment.",
  kicker: {
    cost: "",
    keyword: "behold",
    behold: { filter: { type: "creature", subtype: "Gamma" }, text: "a Gamma creature" },
    targets: [
      "creature-you-control",
      { kind: "other", of: "creature", than: { slot: 0 } },
      { kind: "permanent", filter: { typesAnyOf: ["artifact", "enchantment"], notTypes: ["creature"] } },
    ],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "fight", a: 0, b: 1, oneSided: true },
        { kind: "destroy", target: 2 },
      ],
    },
  },
  targets: ["creature-you-control", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
});
