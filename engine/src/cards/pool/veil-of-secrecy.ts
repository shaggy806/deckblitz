import { defineCard } from "../define.js";

export default defineCard({
  name: "Veil of Secrecy",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: {
    onto: "arcane",
    cost: "",
    also: {
      text: "Return a blue creature you control to its owner's hand",
      returnToHand: { filter: { type: "creature", colors: ["U"] }, count: 1 },
    },
  },
  text: "Target creature gains shroud until end of turn and can't be blocked this turn. (A creature with shroud can't be the target of spells or abilities.)\nSplice onto Arcane—Return a blue creature you control to its owner's hand. (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "shroud", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
    ],
  },
});
