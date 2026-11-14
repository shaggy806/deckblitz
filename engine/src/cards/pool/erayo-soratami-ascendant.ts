import { defineCard } from "../define.js";

// "The fourth spell of a turn" is the turn's fourth, whoever cast each of
// them — not one caster's fourth (the timing wrapper's `nthEachTurn`) — so
// it's a trigger condition (`whileCondition`, rule 603.1, as Nullstone
// Gargoyle's) counting every player's spells this turn, the one just cast
// included: exactly four. Spells cast before Erayo arrived count.

const TEXT = "Whenever the fourth spell of a turn is cast, flip Erayo.";

export default defineCard({
  name: "Erayo, Soratami Ascendant",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Monk"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      whileCondition: { kind: "cast-this-turn", who: "any", atLeast: 4, atMost: 4 },
      targets: [],
      effect: { kind: "flip", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Erayo, Soratami Ascendant", "Erayo's Essence"],
  flip: true,
});
