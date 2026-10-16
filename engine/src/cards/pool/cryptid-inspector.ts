import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 17557.

const TEXT =
  "Whenever a face-down permanent you control enters and whenever this creature or another permanent you control is turned face up, put a +1/+1 counter on this creature.";

const COUNTER: EffectSpec = { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 };

export default defineCard({
  name: "Cryptid Inspector",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { faceDown: true } },
      targets: [],
      effect: COUNTER,
      resolve: null,
      text: TEXT,
    },
    {
      // "This creature or another permanent you control": any permanent you
      // control, this one included — turned face up, it has this ability
      // from then on (rule 708.8).
      trigger: { on: "turned-face-up", who: "you-control" },
      sameAbilityAs: 0,
      targets: [],
      effect: COUNTER,
      resolve: null,
      text: TEXT,
    },
  ],
});
