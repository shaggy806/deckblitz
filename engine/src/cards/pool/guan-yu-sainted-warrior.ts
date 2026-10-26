import { defineCard } from "../define.js";

// EDHREC rank 24960.
//
// Rulings:
//   [2009-10-01] If Guan Yu, Sainted Warrior is removed from the graveyard after the ability
//     triggers but before it resolves, it won't get shuffled into your library.
//   [2009-10-01] Despite the similarities between horsemanship and flying, horsemanship doesn't
//     interact with flying or reach.
//   [2009-10-01] If a replacement effect has Guan Yu move to a different zone instead of being put
//     into the graveyard, the ability won't trigger at all.

export default defineCard({
  name: "Guan Yu, Sainted Warrior",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Warrior"],
  power: 3,
  toughness: 5,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\nWhen Guan Yu is put into your graveyard from the battlefield, you may shuffle Guan Yu into your library.",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"], filter: { ownedBy: "you" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Shuffle Guan Yu into your library?",
        effect: { kind: "shuffle-into-library", target: "trigger-object" },
      },
      resolve: null,
      text: "When Guan Yu is put into your graveyard from the battlefield, you may shuffle Guan Yu into your library.",
    },
  ],
});
