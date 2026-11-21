import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 18496.
//
// The upkeep player chooses, then pays (`choose-permanents` `payEach`): no more than they could
// pay for (rule 118.3), choosing none declining, and the creatures chosen untapped together.
const STATIC_TEXT = "Creatures don't untap during their controllers' untap steps.";
const UPKEEP_TEXT =
  "At the beginning of each player's upkeep, that player may choose any number of tapped nongreen creatures they control and pay {2} for each creature chosen this way. If the player does, untap those creatures.";

export default defineCard({
  name: "Dream Tides",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${STATIC_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" } },
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
        filter: { type: "creature", tapped: true, notColors: ["G"], controlledBy: "you" },
        upTo: { countOf: { type: "creature", tapped: true, notColors: ["G"] } },
        payEach: "{2}",
        thenTogether: true,
        then: { kind: "untap-all", filter: { thisWay: "chosen" } },
        prompt: "Choose tapped nongreen creatures to untap, paying {2} for each",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
