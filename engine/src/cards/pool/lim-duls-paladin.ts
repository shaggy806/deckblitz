import { defineCard } from "../define.js";

// Alliances (ALL). EDHREC rank 29205.
//
// "If you don't" is the `may`'s `else`; with no card in hand there's nothing
// to discard, so it goes straight to sacrificing and drawing. The draw
// happens even if the Paladin is already gone. The unblocked trigger is
// Floral Spuzzem's assigns-no-combat-damage, its trigger player the defending
// player (Guiltfeeder).

const UPKEEP = "At the beginning of your upkeep, you may discard a card. If you don't, sacrifice this creature and draw a card.";
const BLOCKED = "Whenever this creature becomes blocked, it gets +6/+3 until end of turn.";
const UNBLOCKED =
  "Whenever this creature attacks and isn't blocked, it assigns no combat damage this turn and defending player loses 4 life.";
const SAC_AND_DRAW = {
  kind: "sequence",
  effects: [{ kind: "sacrifice-source" }, { kind: "draw", amount: 1 }],
} as const;

export default defineCard({
  name: "Lim-Dûl's Paladin",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 0,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${UPKEEP}\n${BLOCKED}\n${UNBLOCKED}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "hand-size", atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Discard a card? If you don't, sacrifice Lim-Dûl's Paladin and draw a card.",
          effect: { kind: "discard", target: "you", amount: 1 },
          else: SAC_AND_DRAW,
        },
        else: SAC_AND_DRAW,
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 6, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: BLOCKED,
    },
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "assigns-no-combat-damage", target: "source" },
          { kind: "lose-life", who: "trigger-player", amount: 4 },
        ],
      },
      resolve: null,
      text: UNBLOCKED,
    },
  ],
});
