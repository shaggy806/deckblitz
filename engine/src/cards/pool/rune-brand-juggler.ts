import { defineCard } from "../define.js";

// "Up to one target creature you control" can be this creature itself, and a
// suspected Juggler can be sacrificed to pay for its own ability (the ruling).

const SUSPECT_TEXT = "When this creature enters, suspect up to one target creature you control.";
const SAC_TEXT = "{3}{B}{R}, Sacrifice a suspected creature: Target creature gets -5/-5 until end of turn.";

export default defineCard({
  name: "Rune-Brand Juggler",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: `${SUSPECT_TEXT} (A suspected creature has menace and can't block.)\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: { kind: "suspect", target: 0 },
      resolve: null,
      text: SUSPECT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}{R}", tap: false, sacrifice: { filter: { type: "creature", suspected: true } } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -5, toughness: -5, duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
