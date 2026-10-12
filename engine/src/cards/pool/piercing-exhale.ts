import { defineCard } from "../define.js";

// EDHREC rank 14002.
//
// "You may behold a Dragon" is an optional additional cost (rule 601.2b), a
// kicker by another name: "if a Dragon was beheld" (701.4b) is the kicked
// effect, offered only with a Dragon to behold. Bite Down's one-sided fight;
// with either target illegal as it resolves, no damage is dealt (608.2b).

export default defineCard({
  name: "Piercing Exhale",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, you may behold a Dragon. (You may choose a Dragon you control or reveal a Dragon card from your hand.)\nTarget creature you control deals damage equal to its power to target creature or planeswalker. If a Dragon was beheld, surveil 2.",
  kicker: {
    cost: "",
    keyword: "behold",
    behold: { filter: { subtype: "Dragon" }, text: "a Dragon" },
    effect: {
      kind: "sequence",
      effects: [
        { kind: "fight", a: 0, b: 1, oneSided: true },
        { kind: "surveil", amount: 2 },
      ],
    },
  },
  targets: [
    "creature-you-control",
    { kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } },
  ],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
});
