import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Star Trek Commander (TRC). One ability with two trigger events, written as
// two (Norn's Choirmaster's shape); "it" is the commander that entered or
// attacked.

const TEXT =
  "Whenever a commander you control enters or attacks, put a +1/+1 counter on it, then reveal cards from the top of your library until you reveal a land card. Put that card onto the battlefield tapped and the rest on the bottom of your library in a random order.";
const COMMANDER = { isCommander: true } as const;
const EFFECT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
    { kind: "reveal-until", filter: { type: "land" }, put: "battlefield", tapped: true, rest: "bottom-random" },
  ],
};

export default defineCard({
  name: "Janice Rand, Essential Aide",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: COMMANDER },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "you-control", filter: COMMANDER },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
