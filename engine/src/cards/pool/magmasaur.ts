import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Tempest (TMP). EDHREC rank 27453.
//
// The upkeep is Guiding Hydra's "you may remove a counter" offered only while
// a counter can come off (this same object on the battlefield, with a +1/+1
// counter) — otherwise "you don't" applies as surely as declining does
// (Gargantuan Gorilla's penalty shape). The damage reads the counters as the
// creature last existed once it's sacrificed (Time Bomb's
// `countersOn: "source"`), and hits each creature without flying and each
// player at once (Earthquake's `simultaneous` pair).

const ENTERS_TEXT = "This creature enters with five +1/+1 counters on it.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may remove a +1/+1 counter from this creature. If you don't, sacrifice this creature and it deals damage equal to the number of +1/+1 counters on it to each creature without flying and each player.";

const COUNTERS = { countersOn: "source", counter: "+1/+1" } as const;

const PENALTY: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "sacrifice-source" },
    {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: COUNTERS },
        { kind: "damage", amount: COUNTERS, who: "each-player" },
      ],
    },
  ],
};

export default defineCard({
  name: "Magmasaur",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Dinosaur"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 5 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
          ],
        },
        then: {
          kind: "may",
          prompt:
            "Remove a +1/+1 counter from Magmasaur? If you don't, sacrifice it and it deals damage equal to its +1/+1 counters to each creature without flying and each player.",
          effect: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
          else: PENALTY,
        },
        else: PENALTY,
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
