import { defineCard } from "../define.js";

export default defineCard({
  name: "Germination Practicum",
  manaCost: "{3}{G}{G}",
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text:
    "Put two +1/+1 counters on each creature you control.\n" +
    "Paradigm (Then exile this spell. After you first resolve a spell with this name, you may cast a copy of it from exile without paying its mana cost at the beginning of each of your first main phases.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 2 },
      { kind: "paradigm" },
    ],
  },
  exileOnResolve: true,
});
