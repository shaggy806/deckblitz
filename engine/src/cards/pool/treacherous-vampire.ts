import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Judgment (JUD). EDHREC rank 32036.
//
// Harvest Wurm's frame for "sacrifice it unless you exile a card from your
// graveyard": with an empty graveyard it's sacrificed unasked; otherwise you
// may exile one (your choice of which), or sacrifice it. One trigger for
// attacking, one for blocking.

const ATTACK_TEXT =
  "Whenever this creature attacks or blocks, sacrifice it unless you exile a card from your graveyard.";
const THRESHOLD_TEXT =
  'Threshold — As long as there are seven or more cards in your graveyard, this creature gets +2/+2 and has "When this creature dies, you lose 6 life."';

const SACRIFICE_UNLESS_EXILE: EffectSpec = {
  kind: "conditional",
  condition: { kind: "cards-in-graveyard", atLeast: 1 },
  then: {
    kind: "may",
    prompt: "Exile a card from your graveyard to keep Treacherous Vampire? (Otherwise it's sacrificed.)",
    effect: {
      kind: "look-and-choose",
      zone: "graveyard",
      min: 1,
      max: 1,
      destination: "exile",
      unlinked: true,
      leftover: "stay",
    },
    else: { kind: "sacrifice-source" },
  },
  else: { kind: "sacrifice-source" },
};

export default defineCard({
  name: "Treacherous Vampire",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${THRESHOLD_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: SACRIFICE_UNLESS_EXILE,
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: SACRIFICE_UNLESS_EXILE,
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [2, 2],
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "lose-life", amount: 6 },
          resolve: null,
          text: "When this creature dies, you lose 6 life.",
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
