import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

const SAC_TEXT = "When Kroxa enters, sacrifice it unless it escaped.";
const DISCARD_TEXT =
  "Whenever Kroxa enters or attacks, each opponent discards a card, then each opponent who didn't discard a nonland card this way loses 3 life.";

// An opponent who can't discard hasn't discarded a nonland card, and loses 3
// (the ruling): `atMost: 0` counts them.
const PUNISH: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "discard", target: "each-opponent", amount: 1 },
    {
      kind: "for-each-player",
      who: "each-opponent",
      effect: {
        kind: "conditional",
        condition: { kind: "this-way", what: "discarded", who: "that-player", filter: { notTypes: ["land"] }, atMost: 0 },
        then: { kind: "lose-life", amount: 3, who: "that-player" },
      },
    },
  ],
};

export default defineCard({
  name: "Kroxa, Titan of Death's Hunger",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Giant"],
  power: 6,
  toughness: 6,
  text:
    `${SAC_TEXT}\n${DISCARD_TEXT}\n` +
    "Escape—{B}{B}{R}{R}, Exile five other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  escape: { cost: "{B}{B}{R}{R}", exileCount: 5 },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "source", filter: { castVia: "escape" } } },
        then: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: PUNISH,
      resolve: null,
      text: DISCARD_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: PUNISH,
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
