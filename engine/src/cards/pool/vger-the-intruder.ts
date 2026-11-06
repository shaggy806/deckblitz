import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 29996.

const TRIGGER_TEXT = "Whenever V'Ger enters or attacks, choose one —";

// "Creatures your opponents control get -1/-0" reaches only those on the
// battlefield as it resolves (rule 611.2c).
const MODAL: EffectSpec = {
  kind: "modal",
  announced: true,
  minModes: 1,
  maxModes: 1,
  modes: [
    {
      text: "Look at target opponent's hand, then draw a card.",
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-at-hand", target: 0 },
          { kind: "draw", amount: 1 },
        ],
      },
    },
    {
      text: "Creatures your opponents control get -1/-0 until your next turn.",
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -1,
        toughness: 0,
        duration: "until-your-next-turn",
      },
    },
  ],
};

export default defineCard({
  name: "V'Ger, the Intruder",
  manaCost: "{6}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 5,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}\n• Look at target opponent's hand, then draw a card.\n• Creatures your opponents control get -1/-0 until your next turn.`,
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
