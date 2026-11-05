import { defineCard } from "../define.js";

// EDHREC rank 13960.
//
// Rulings:
//   [2005-02-01] If there are two Hokori on the battlefield (for example, if Mirror Gallery is on
//     the battlefield), each player untaps two lands they control at the beginning of their
//     upkeep.

export default defineCard({
  name: "Hokori, Dust Drinker",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: "Lands don't untap during their controllers' untap steps.\nAt the beginning of each player's upkeep, that player untaps a land they control.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "land" } },
      restrictions: ["doesnt-untap"],
      text: "Lands don't untap during their controllers' untap steps.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "active-player",
        filter: { type: "land", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "untap", target: 0 },
        prompt: "Untap a land you control",
      },
      resolve: null,
      text: "At the beginning of each player's upkeep, that player untaps a land they control.",
    },
  ],
});
