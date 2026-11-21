import { defineCard } from "../define.js";

// Fallen Empires (FEM). EDHREC rank 32308.
//
// Dream Tides' upkeep (`choose-permanents` `payEach`) over blue creatures, each paid for with {U}.
const STATIC_TEXT = "Blue creatures don't untap during their controllers' untap steps.";
const UPKEEP_TEXT =
  "At the beginning of each player's upkeep, that player may choose any number of tapped blue creatures they control and pay {U} for each creature chosen this way. If the player does, untap those creatures.";

export default defineCard({
  name: "Thelon's Curse",
  manaCost: "{G}{G}",
  colors: ["G"],
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
        payEach: "{U}",
        thenTogether: true,
        then: { kind: "untap-all", filter: { thisWay: "chosen" } },
        prompt: "Choose tapped blue creatures to untap, paying {U} for each",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
