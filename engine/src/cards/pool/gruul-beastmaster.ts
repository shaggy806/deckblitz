import { defineCard } from "../define.js";

// EDHREC rank 24811.
//
// X is read once, as the trigger resolves (the ruling), from this creature's
// power — as it last existed if it has left (the ruling) — and never below 0
// (the ruling; an amount is clamped at 0, rule 107.1b).
const ATTACK_TEXT =
  "Whenever this creature attacks, another target creature you control gets +X/+0 until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Gruul Beastmaster",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  keywords: ["riot"],
  text: `Riot (This creature enters with your choice of a +1/+1 counter or haste.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "creature" } } }],
      effect: { kind: "modify-pt", target: 0, power: { powerOf: "source" }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
