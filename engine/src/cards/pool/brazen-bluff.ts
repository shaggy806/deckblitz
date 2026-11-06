import { defineCard } from "../define.js";

// EDHREC rank 27145.
// The spell's controller chooses whether to exile it (an `unless` whose
// chooser is the target's controller). Exiling a spell isn't countering it.
// If they don't, you may cast a noncreature spell from your hand for free as
// this resolves (rule 608.2g).

export default defineCard({
  name: "Brazen Bluff",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose target noncreature spell an opponent controls. That player may exile it. If they don't, you may cast a noncreature spell from your hand without paying its mana cost.",
  targets: [{ kind: "spell", whose: "opponent", filter: { notTypes: ["creature"] } }],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ doing: { kind: "exile", target: 0 }, text: "Exile your spell" }],
    otherwise: { kind: "cast-now", from: "hand", free: true, spell: { notTypes: ["creature"] } },
  },
});
