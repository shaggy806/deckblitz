import { defineCard } from "../define.js";

// EDHREC rank 28743.
//
// "You may behold a Hero" is an optional additional cost (rule 601.2b), a
// kicker by another name: "if a Hero was beheld" (701.4b) is the kicked
// effect, and the kicked cast is offered only with a Hero to behold.

export default defineCard({
  name: "Hyperion's Atomic Vision",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: {
    cost: "",
    keyword: "behold",
    behold: { filter: { subtype: "Hero" }, text: "a Hero" },
    effect: {
      kind: "sequence",
      effects: [{ kind: "destroy", target: 0 }, { kind: "scry", amount: 2 }],
    },
  },
  text: "As an additional cost to cast this spell, you may behold a Hero. (You may choose a Hero you control or reveal a Hero card from your hand.)\nDestroy target tapped creature. If a Hero was beheld, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
});
