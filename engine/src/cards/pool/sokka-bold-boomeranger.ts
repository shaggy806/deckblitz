import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 9803. The enters trigger is Kinetic Augur's "discard up to two
// cards, then draw that many cards" (how many is chosen as it resolves).

const ENTERS_TEXT = "When Sokka enters, discard up to two cards, then draw that many cards.";
const CAST_TEXT = "Whenever you cast an artifact or Lesson spell, put a +1/+1 counter on Sokka.";

const discardThenDraw = (n: number): EffectSpec => ({
  kind: "sequence",
  effects: [
    { kind: "discard", target: "you", amount: n },
    { kind: "draw", amount: { thisWay: "discarded" } },
  ],
});

export default defineCard({
  name: "Sokka, Bold Boomeranger",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 1,
  toughness: 1,
  text: `${ENTERS_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Discard no cards", effect: { kind: "sequence", effects: [] } },
          { text: "Discard one card, then draw a card", effect: discardThenDraw(1) },
          { text: "Discard two cards, then draw that many cards", effect: discardThenDraw(2) },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ type: "artifact" }, { subtype: "Lesson" }] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
