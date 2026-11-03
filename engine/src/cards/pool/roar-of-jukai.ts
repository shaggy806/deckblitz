import { defineCard } from "../define.js";

// Rulings:
//   Roar of Jukai can be cast even if you don't control a Forest or there are no blocked creatures.
//     If you control no Forests or if there are no blocked creatures, the spell does nothing.
//   You reveal all cards you intend to splice at the same time. Each individual card can be spliced
//     only once onto any one spell.

export default defineCard({
  name: "Roar of Jukai",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: {
    onto: "arcane",
    cost: "",
    also: { text: "An opponent gains 5 life", opponentGainsLife: 5 },
  },
  text: "If you control a Forest, each blocked creature gets +2/+2 until end of turn.\nSplice onto Arcane—An opponent gains 5 life. (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 },
    then: {
      kind: "modify-pt-all",
      filter: { type: "creature", blocked: true },
      power: 2,
      toughness: 2,
      duration: "end-of-turn",
    },
  },
});
