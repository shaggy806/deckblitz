import { defineCard } from "../define.js";

// EDHREC rank 17235.

const TEXT =
  "Whenever this creature or another Warrior you control enters, you may exile target creature card from a graveyard. If you do, you gain 1 life.";

const EFFECT = {
  kind: "may",
  prompt: "Exile target creature card from a graveyard?",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "exiled", atLeast: 1 },
        then: { kind: "gain-life", amount: 1 },
      },
    ],
  },
} as const;

export default defineCard({
  name: "Mardu Woe-Reaper",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: TEXT,
  // "This creature or another Warrior": itself whatever its types, and any
  // other Warrior — two triggers that never both fire for one entry.
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Warrior" }, otherOnly: true },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
