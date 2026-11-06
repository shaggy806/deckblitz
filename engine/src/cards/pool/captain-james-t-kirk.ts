import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 26338.

const TRIGGER_TEXT =
  "Whenever Captain Kirk enters or attacks, choose one. If you have no cards in hand, choose one or more instead.";

// The modes are chosen as the ability goes on the stack (rule 700.2b), so the
// "no cards in hand" check is read then: `maxModes` is a live amount.
const MODAL: EffectSpec = {
  kind: "modal",
  announced: true,
  minModes: 1,
  maxModes: { ifCondition: { kind: "hand-size", atMost: 0 }, then: 3, else: 1 },
  modes: [
    {
      text: "Discard a card, then draw a card.",
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
    },
    {
      text: "Create a 1/1 red Officer creature token.",
      effect: { kind: "create-token", token: "Officer Token", count: 1 },
    },
    {
      text: "Creatures you control get +1/+0 until end of turn.",
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
    },
  ],
};

export default defineCard({
  name: "Captain James T. Kirk",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 2,
  text: `${TRIGGER_TEXT}\n• Discard a card, then draw a card.\n• Create a 1/1 red Officer creature token.\n• Creatures you control get +1/+0 until end of turn.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: MODAL,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: MODAL,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
