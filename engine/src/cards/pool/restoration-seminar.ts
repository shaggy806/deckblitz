import { defineCard } from "../define.js";

export default defineCard({
  name: "Restoration Seminar",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text:
    "Return target nonland permanent card from your graveyard to the battlefield.\n" +
    "Paradigm (Then exile this spell. After you first resolve a spell with this name, you may cast a copy of it from exile without paying its mana cost at the beginning of each of your first main phases.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["land", "instant", "sorcery"] } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "put-onto-battlefield", target: 0 }, { kind: "paradigm" }],
  },
  exileOnResolve: true,
});
