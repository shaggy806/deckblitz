import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 19877.
//
// Dream Tides' upkeep (`choose-permanents` `payEach`) over creatures without flying. Flying is read
// as each creature is now, for the untap step and the choice alike.
const STATIC_TEXT = "Creatures without flying don't untap during their controllers' untap steps.";
const UPKEEP_TEXT =
  "At the beginning of each player's upkeep, that player may choose any number of tapped creatures without flying they control and pay {2} for each creature chosen this way. If the player does, untap those creatures.";

export default defineCard({
  name: "Mudslide",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${STATIC_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", notKeyword: "flying" } },
      restrictions: ["doesnt-untap"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "active-player",
        filter: { type: "creature", tapped: true, notKeyword: "flying", controlledBy: "you" },
        upTo: { countOf: { type: "creature", tapped: true, notKeyword: "flying" } },
        payEach: "{2}",
        thenTogether: true,
        then: { kind: "untap-all", filter: { thisWay: "chosen" } },
        prompt: "Choose tapped creatures without flying to untap, paying {2} for each",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
