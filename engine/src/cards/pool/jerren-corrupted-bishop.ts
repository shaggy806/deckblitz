import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

const HUMAN_TEXT =
  "Whenever Jerren enters or another nontoken Human you control dies, you lose 1 life and create a 1/1 white Human creature token.";
const LIFELINK_TEXT = "{2}: Target Human you control gains lifelink until end of turn.";
const END_TEXT =
  "At the beginning of your end step, if you have exactly 13 life, you may pay {4}{B}{B}. If you do, transform Jerren.";

const LOSE_AND_MAKE: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "lose-life", amount: 1 },
    { kind: "create-token", token: "Human Token", count: 1 },
  ],
};

export default defineCard({
  name: "Jerren, Corrupted Bishop",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: `${HUMAN_TEXT}\n${LIFELINK_TEXT}\n${END_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Human" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: LIFELINK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: LOSE_AND_MAKE,
      resolve: null,
      text: HUMAN_TEXT,
    },
    {
      // "Dies" is a creature's (rule 700.4).
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", subtype: "Human", token: false },
        otherOnly: true,
      },
      targets: [],
      effect: LOSE_AND_MAKE,
      resolve: null,
      text: HUMAN_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      // An intervening-if: exactly 13 life as it triggers and again as it
      // resolves, or the payment isn't offered (its ruling).
      condition: { kind: "life-total", who: "you", atLeast: 13, atMost: 13 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {4}{B}{B} to transform Jerren?",
        cost: "{4}{B}{B}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: ["Jerren, Corrupted Bishop", "Ormendahl, the Corrupter"],
  transform: true,
});
