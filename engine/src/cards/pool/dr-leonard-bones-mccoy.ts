import { defineCard } from "../define.js";

// EDHREC rank 30385.
//
// The second mode nests two delayed triggers (rule 603.7): "when it dies this
// turn" (Graceful Reprieve's), whose effect sets up "at the beginning of the
// next end step" — the inner one inherits the outer one's trigger object, the
// card that died (Shirei, Shizo's Caretaker's shape), and returns it with a
// +1/+1 counter.

const ETB_TEXT = "When Dr. McCoy enters, choose one —";
const RETURN_TEXT = "Return target non-Doctor permanent card from your graveyard to your hand.";
const SAVE_TEXT =
  "Choose up to one other target creature. When it dies this turn, return that card to the battlefield under its owner's control with a +1/+1 counter on it at the beginning of the next end step.";

export default defineCard({
  name: "Dr. Leonard \"Bones\" McCoy",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}\n• ${RETURN_TEXT}\n• ${SAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: RETURN_TEXT,
            targets: [
              {
                kind: "card-in-graveyard",
                whose: "you",
                filter: { notTypes: ["instant", "sorcery"], notSubtypes: ["Doctor"] },
              },
            ],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
          {
            text: SAVE_TEXT,
            targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
            effect: {
              kind: "delayed-trigger",
              at: { leaves: 0, to: ["graveyard"], thisTurn: true },
              effect: {
                kind: "delayed-trigger",
                at: { step: "end" },
                effect: {
                  kind: "put-onto-battlefield",
                  target: "trigger-object",
                  withCounters: { kind: "+1/+1", amount: 1 },
                },
                text: "Return that card to the battlefield under its owner's control with a +1/+1 counter on it.",
              },
              text: "When that creature dies this turn, return that card to the battlefield under its owner's control with a +1/+1 counter on it at the beginning of the next end step.",
            },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
