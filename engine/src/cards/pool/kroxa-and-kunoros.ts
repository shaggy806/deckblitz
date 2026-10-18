import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 14927.
//
// Rulings:
//   [2023-04-14] The last ability of Kroxa and Kunoros triggers and goes on the stack without a
//     target. If you exile five cards from your graveyard, the second "reflexive" triggered
//     ability will trigger. You'll choose the target creature card for that second ability at
//     that time.
//
// "You may exile five cards from your graveyard" is Aegis Sculptor's shape:
// the five chosen as it resolves, fewer than five exiled isn't having done
// it. "When you do" is a reflexive trigger (rule 603.12) whose target is
// chosen only then (the ruling), so it can't be one of the five just exiled.

const TEXT =
  "Whenever Kroxa and Kunoros enters or attacks, you may exile five cards from your graveyard. When you do, return target creature card from your graveyard to the battlefield.";

const EXILE_FIVE: EffectSpec = {
  kind: "may",
  prompt: "Exile five cards from your graveyard?",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 5,
        max: 5,
        destination: "exile",
        leftover: "stay",
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "exiled", atLeast: 5 },
        then: {
          kind: "reflexive-trigger",
          targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
          effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
          text: "When you do, return target creature card from your graveyard to the battlefield.",
        },
      },
    ],
  },
};

export default defineCard({
  name: "Kroxa and Kunoros",
  manaCost: "{3}{R}{W}{B}",
  colors: ["W", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Giant", "Dog"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance", "menace", "lifelink"],
  text: `Vigilance, menace, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: EXILE_FIVE,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: EXILE_FIVE,
      resolve: null,
      text: TEXT,
    },
  ],
});
