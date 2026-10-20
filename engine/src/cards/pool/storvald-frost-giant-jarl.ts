import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";
import type { EffectSpec } from "../../effects.js";
import { ward } from "../helpers.js";

// EDHREC rank 11594. "Enters or attacks" is two triggers with one modal
// effect, its modes announced as it goes on the stack (rules 603.3c,
// 700.2b), each mode with a target of its own — the same creature may be
// both (rule 115.3, the ruling), and the modes happen in the listed order, so
// the later 1/1 wins in layer 7b. Base P/T is an `animate` of no types (Quandrix
// Charm's shape): counters and other modifications still apply on top.
//
// Rulings:
//   [2021-07-23] Storvald's triggered ability will overwrite any previous effects that set the
//     creature's power and toughness to specific numbers. Effects that otherwise modify that
//     creature's power and toughness will still apply no matter when they took effect. The same is
//     true for +1/+1 counters.
//   [2021-07-23] You can choose the same creature as the target for both modes if you wanted to.
//   [2021-07-23] If you choose both modes, the effects will happen in the listed order.

const OTHERS_TEXT = "Other creatures you control have ward {3}.";
const TRIGGER_TEXT = "Whenever Storvald enters or attacks, choose one or both —";
const BIG_TEXT = "Target creature has base power and toughness 7/7 until end of turn.";
const SMALL_TEXT = "Target creature has base power and toughness 1/1 until end of turn.";

const setBase = (n: number): EffectSpec => ({
  kind: "animate",
  target: 0,
  power: n,
  toughness: n,
  addTypes: [],
  addSubtypes: [],
  duration: "end-of-turn",
});

const modal: EffectSpec = {
  kind: "modal",
  announced: true,
  minModes: 1,
  maxModes: 2,
  modes: [
    { text: BIG_TEXT, targets: ["creature"], effect: setBase(7) },
    { text: SMALL_TEXT, targets: ["creature"], effect: setBase(1) },
  ],
};

const onEvent = (trigger: TriggeredAbility["trigger"]): TriggeredAbility => ({
  trigger,
  targets: [],
  effect: modal,
  resolve: null,
  text: TRIGGER_TEXT,
});

export default defineCard({
  name: "Storvald, Frost Giant Jarl",
  manaCost: "{4}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 7,
  toughness: 7,
  text: `Ward {3}\n${OTHERS_TEXT}\n${TRIGGER_TEXT}\n• ${BIG_TEXT}\n• ${SMALL_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" }, excludeSelf: true },
      grantsTriggered: [ward({ mana: "{3}" })],
      text: OTHERS_TEXT,
    },
  ],
  triggered: [
    ward({ mana: "{3}" }),
    onEvent({ on: "enters-battlefield", who: "self" }),
    onEvent({ on: "attacks", who: "self" }),
  ],
});
