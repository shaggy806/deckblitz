import { defineCard } from "../define.js";

// EDHREC rank 5175.
//
// The permanents are chosen as the trigger resolves, not targeted, and exiled
// together: `choose-permanents`' `thenTogether` hands the whole set to one
// `flicker` (`{ from: 0 }`), whose single delayed ability returns them together
// at the controller's next upkeep (rule 603.7), only those still in exile as
// the same cards (rule 400.7). A token exiled this way ceases to exist (111.7),
// hence "nontoken".

const PUMP_TEXT = "Creatures you control get +1/+0 and have haste.";
const FLICKER_TEXT =
  "At the beginning of your end step, exile any number of nontoken artifacts and/or creatures you control. Return those cards to the battlefield under their owner's control at the beginning of your next upkeep.";
const MINE = { typesAnyOf: ["artifact", "creature"], token: false, controlledBy: "you" } as const;

export default defineCard({
  name: "Nahiri's Resolve",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  types: ["enchantment"],
  text: `${PUMP_TEXT}\n${FLICKER_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [1, 0],
      grantKeywords: ["haste"],
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: MINE,
        upTo: { countOf: MINE },
        thenTogether: true,
        then: {
          kind: "flicker",
          target: { from: 0 },
          returnAt: { step: "upkeep", whose: "you" },
          returnText: "Return those cards to the battlefield under their owner's control.",
        },
        prompt: "Exile any number of nontoken artifacts and/or creatures you control",
      },
      resolve: null,
      text: FLICKER_TEXT,
    },
  ],
});
