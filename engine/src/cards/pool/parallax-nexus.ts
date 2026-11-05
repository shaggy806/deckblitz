import { defineCard } from "../define.js";

// EDHREC rank 29095. Fading 5 (rule 702.32) as its two pieces, Parallax Wave's.
// The exile is linked to this stint (rule 607.2a), and the leaves trigger
// returns each linked card to its owner's hand. The opponent chooses the card
// (the ruling).
const FADING = "Fading 5";
const FADING_UPKEEP =
  "(This enchantment enters with five fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)";
const ABILITY =
  "Remove a fade counter from this enchantment: Target opponent exiles a card from their hand. Activate only as a sorcery.";
const LEAVE = "When this enchantment leaves the battlefield, each player returns to their hand all cards they own exiled with it.";

export default defineCard({
  name: "Parallax Nexus",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${FADING} ${FADING_UPKEEP}\n${ABILITY}\n${LEAVE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 5 } },
      text: FADING,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "fade", count: 1 } },
      targets: ["opponent"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 1,
          max: 1,
          destination: "exile",
          leftover: "stay",
        },
      },
      resolve: null,
      text: ABILITY,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "fade", compare: { op: "gte", n: 1 } },
        then: { kind: "remove-counter", target: "source", counter: "fade", amount: 1 },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: FADING_UPKEEP,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: LEAVE,
    },
  ],
});
