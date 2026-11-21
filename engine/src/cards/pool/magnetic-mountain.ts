import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 23530.
//
// Dream Tides' upkeep (`choose-permanents` `payEach`) over blue creatures, each paid for with {4}.
const STATIC_TEXT = "Blue creatures don't untap during their controllers' untap steps.";
const UPKEEP_TEXT =
  "At the beginning of each player's upkeep, that player may choose any number of tapped blue creatures they control and pay {4} for each creature chosen this way. If the player does, untap those creatures.";

export default defineCard({
  name: "Magnetic Mountain",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${STATIC_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["U"] } },
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
        filter: { type: "creature", tapped: true, colors: ["U"], controlledBy: "you" },
        upTo: { countOf: { type: "creature", tapped: true, colors: ["U"] } },
        payEach: "{4}",
        thenTogether: true,
        then: { kind: "untap-all", filter: { thisWay: "chosen" } },
        prompt: "Choose tapped blue creatures to untap, paying {4} for each",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
