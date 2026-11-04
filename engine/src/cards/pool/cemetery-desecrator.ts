import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Rulings: you choose which counters come off, of as many kinds as you like,
// and with fewer than X there all of them do; the mode and target of "when you
// do" are chosen as that second ability goes on the stack, after the card is
// exiled (rule 603.12). "Another": as it dies this creature is in a graveyard
// itself, and can't exile itself. With no other card there nothing is exiled,
// so nothing triggers.
const ENTER_OR_DIES =
  "When this creature enters or dies, exile another card from a graveyard. When you do, choose one —\n• Remove X counters from target permanent, where X is the mana value of the exiled card.\n• Target creature an opponent controls gets -X/-X until end of turn, where X is the mana value of the exiled card.";

const X = { triggerValue: true } as const;
const MINUS_X = { product: [X, -1] } as const;

const EXILE_ANOTHER: EffectSpec = {
  kind: "look-and-choose",
  zone: "graveyards",
  min: 1,
  max: 1,
  destination: "exile",
  unlinked: true,
  leftover: "stay",
  filter: { isSource: false },
  then: {
    kind: "reflexive-trigger",
    targets: [],
    value: { thisWay: "exiled", who: "each-player", sumOf: "mana-value" },
    effect: {
      kind: "modal",
      announced: true,
      minModes: 1,
      maxModes: 1,
      modes: [
        {
          text: "Remove X counters from target permanent, where X is the mana value of the exiled card.",
          targets: ["permanent"],
          effect: { kind: "remove-counters", target: 0, counter: "any", count: X },
        },
        {
          text: "Target creature an opponent controls gets -X/-X until end of turn, where X is the mana value of the exiled card.",
          targets: ["creature-an-opponent-controls"],
          effect: { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
        },
      ],
    },
    text: "When you do, choose one — remove X counters from target permanent; or target creature an opponent controls gets -X/-X until end of turn.",
  },
};

export default defineCard({
  name: "Cemetery Desecrator",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${ENTER_OR_DIES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: EXILE_ANOTHER,
      resolve: null,
      text: ENTER_OR_DIES,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: EXILE_ANOTHER,
      resolve: null,
      text: ENTER_OR_DIES,
    },
  ],
});
