import { defineCard } from "../define.js";

// EDHREC rank 17806. Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] After Flawless Forgery resolves, the exiled card remains exiled.
//   [2022-04-29] If you pay the casualty cost of a spell, the copy will resolve before the
//     original spell.
//   [2022-04-29] You may sacrifice only one creature to pay a spell's casualty cost, and you copy
//     the spell only once.
//
// Arcane Proxy's exile-and-cast-a-copy, aimed at an opponent's graveyard.
// The card stays in exile; only the copy is cast. Casualty's copy may aim at
// a different card.
const TEXT =
  "Exile target instant or sorcery card from an opponent's graveyard. Copy that card. You may cast the copy without paying its mana cost.";

export default defineCard({
  name: "Flawless Forgery",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  casualty: 3,
  text:
    "Casualty 3 (As you cast this spell, you may sacrifice a creature with power 3 or greater. When you do, copy this spell and you may choose a new target for the copy.)\n" +
    TEXT,
  targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true },
    ],
  },
});
