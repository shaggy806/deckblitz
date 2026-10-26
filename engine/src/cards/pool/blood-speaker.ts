import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 13592.
//
// Rulings:
//   [2004-12-01] The return-to-hand triggered ability triggers while Blood Speaker is in your
//     graveyard, no matter how it got there.
//
// "If you do" is `sacrifice-source`'s `then`; the return is Ovalchase
// Daredevil's graveyard trigger, mandatory here.

const UPKEEP =
  "At the beginning of your upkeep, you may sacrifice this creature. If you do, search your library for a Demon card, reveal that card, put it into your hand, then shuffle.";
const RETURN = "Whenever a Demon you control enters, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Blood Speaker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Shaman"],
  power: 3,
  toughness: 2,
  text: `${UPKEEP}\n${RETURN}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Blood Speaker to search for a Demon card?",
        effect: {
          kind: "sacrifice-source",
          then: {
            kind: "search-library",
            filter: { subtype: "Demon" },
            destination: "hand",
            min: 0,
            max: 1,
            reveal: true,
          },
        },
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Demon" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN,
    },
  ],
});
