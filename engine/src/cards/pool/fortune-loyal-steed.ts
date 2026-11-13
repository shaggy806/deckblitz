import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";

// EDHREC rank 8189.
//
// The attack trigger sets up a delayed one (rule 603.7) for end of combat,
// which chooses — not targets — up to one creature that saddled Fortune this
// turn (rule 702.171c, `saddledSource`, still the same object), then exiles
// Fortune and it at once and returns them at once (`thenTogether` over a
// `flicker` of `["source", 0]`; with none chosen, Fortune alone). A Fortune
// that left and came back since is a new object (rule 400.7) and stays.

const SCRY_TEXT = "When Fortune enters, scry 2.";
const ATTACK_TEXT =
  "Whenever Fortune attacks while saddled, at end of combat, exile it and up to one creature that saddled it this turn, then return those cards to the battlefield under their owner's control.";

export default defineCard({
  name: "Fortune, Loyal Steed",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Beast", "Mount"],
  power: 2,
  toughness: 4,
  text: `${SCRY_TEXT}\n${ATTACK_TEXT}\n${saddleText(1)}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: SCRY_TEXT,
    },
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end-combat" },
        effect: {
          kind: "choose-permanents",
          filter: { type: "creature", saddledSource: true },
          upTo: 1,
          thenTogether: true,
          then: { kind: "flicker", target: ["source", 0] },
          prompt: "Exile up to one creature that saddled Fortune this turn along with it",
        },
        text: "Exile Fortune and up to one creature that saddled it this turn, then return those cards to the battlefield under their owner's control.",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [saddle(1, saddleText(1))],
});
