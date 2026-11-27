import { defineCard } from "../define.js";

// EDHREC rank 26783.
//
// Rulings:
//   If the revealed instant or sorcery card isn't cast, it gets shuffled back
//     into the library.
//   If the targeted spell can't be countered, it remains on the stack and the
//     rest of Spellshift's effect continues to happen.
//   If there are no instant or sorcery cards in the player's library, the
//     entire library is revealed and then shuffled.
//
// "Its controller" is the spell's controller as it last existed on the stack
// (rule 608.2h), a countered copy's too (its last known information kept as
// it ceased to exist, rule 707.10a). That player reveals, and may cast the
// card found free; the revealed cards, that one included if it stayed, are
// shuffled in.

export default defineCard({
  name: "Spellshift",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target instant or sorcery spell. Its controller reveals cards from the top of their library until they reveal an instant or sorcery card. That player may cast that card without paying its mana cost. Then the player shuffles.",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "as-player",
        who: { controllerOf: 0 },
        effect: {
          kind: "reveal-until",
          filter: { typesAnyOf: ["instant", "sorcery"] },
          then: { kind: "cast-now", target: 0, free: true },
          rest: "shuffle",
        },
      },
    ],
  },
});
