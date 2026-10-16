import { defineCard } from "../define.js";

// EDHREC rank 14613.
//
// Rulings:
//   [2024-09-20] You may target zero cards in your graveyard and still choose to shuffle your
//     library.
//
// The "you may" is the shuffle: saying yes puts the targeted graveyard cards
// (none, or up to four) into the library together and shuffles it, even with
// none targeted (the ruling, rule 701.24d); saying no leaves them where they
// are.
export default defineCard({
  name: "Cathartic Parting",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "The owner of target artifact or enchantment an opponent controls shuffles it into their library. You may shuffle up to four target cards from your graveyard into your library.",
  targets: [
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "enchantment"] } },
    { kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" }, max: 4 },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-into-library", target: 0 },
      {
        kind: "may",
        prompt: "Shuffle the targeted cards from your graveyard into your library?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "for-each-target",
              from: 1,
              simultaneous: true,
              effect: { kind: "put-on-library", target: 1, position: "top" },
            },
            { kind: "shuffle-library" },
          ],
        },
      },
    ],
  },
});
