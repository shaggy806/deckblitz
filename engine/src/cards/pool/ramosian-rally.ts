import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 27086. Angelic Favor's alternative
// cost — one untapped creature you control tapped, gated on a Plains.

const ALT = "If you control a Plains, you may tap an untapped creature you control rather than pay this spell's mana cost.";
const EFFECT = "Creatures you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Ramosian Rally",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `${ALT}\n${EFFECT}`,
  alternativeCost: {
    mana: "{0}",
    tapCreatures: { count: 1, filter: { type: "creature" } },
    condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
  },
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 1,
    toughness: 1,
    duration: "end-of-turn",
  },
});
