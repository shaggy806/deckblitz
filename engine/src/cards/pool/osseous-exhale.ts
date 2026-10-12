import { defineCard } from "../define.js";

// EDHREC rank 17136.
//
// "You may behold a Dragon" is an optional additional cost (rule 601.2b), a
// kicker by another name: "if a Dragon was beheld" (701.4b) is the kicked
// effect, and the kicked cast is offered only with a Dragon to behold.

export default defineCard({
  name: "Osseous Exhale",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: {
    cost: "",
    keyword: "behold",
    behold: { filter: { subtype: "Dragon" }, text: "a Dragon" },
    effect: {
      kind: "sequence",
      effects: [{ kind: "damage", amount: 5, target: 0 }, { kind: "gain-life", amount: 2 }],
    },
  },
  text: "As an additional cost to cast this spell, you may behold a Dragon. (You may choose a Dragon you control or reveal a Dragon card from your hand.)\nOsseous Exhale deals 5 damage to target attacking or blocking creature. If a Dragon was beheld, you gain 2 life.",
  targets: ["attacking-or-blocking-creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
});
