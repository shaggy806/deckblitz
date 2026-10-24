import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 18530.
//
// Rulings:
//   [2015-06-22] Spell mastery is checked as the spell resolves.
//   [2015-06-22] If the spell mastery ability applies, the four Knight tokens will also gain
//     indestructible until end of turn.
//
// The Knights are made first, so the one-shot grant — to the creatures you
// control as it applies — includes them.
export default defineCard({
  name: "Gideon's Phalanx",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Create four 2/2 white Knight creature tokens with vigilance.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, creatures you control gain indestructible until end of turn.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Knight Token", count: 4 },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
        then: {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "indestructible",
          duration: "end-of-turn",
        },
      },
    ],
  },
});
