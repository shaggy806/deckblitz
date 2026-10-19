import { defineCard } from "../define.js";

// EDHREC rank 23156. Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] If you pay the casualty cost of a spell, the copy will resolve before the original
//     spell.
//
// Casualty 1; the copy may take a new target. With its one target illegal
// the spell doesn't resolve at all, so no card is drawn (rule 608.2b).
export default defineCard({
  name: "Rooftop Nuisance",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  casualty: 1,
  text:
    "Casualty 1 (As you cast this spell, you may sacrifice a creature with power 1 or greater. When you do, copy this spell and you may choose a new target for the copy.)\n" +
    "Tap target creature. It doesn't untap during its controller's next untap step.\n" +
    "Draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "draw", amount: 1 },
    ],
  },
});
