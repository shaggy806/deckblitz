import { defineCard } from "../define.js";

// EDHREC rank 31056.
// The Demon check is made as the ability resolves (Raving Oni-Slave's shape).

const TEXT = "Whenever this creature attacks or blocks, you lose 1 life if you don't control a Demon.";
const EFFECT = {
  kind: "conditional",
  condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Demon" }, atLeast: 1 } },
  then: { kind: "lose-life", amount: 1 },
} as const;

export default defineCard({
  name: "Takenuma Bleeder",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Shaman"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
  ],
});
