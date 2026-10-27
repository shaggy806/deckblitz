import { defineCard } from "../define.js";

export default defineCard({
  name: "Droning Bureaucrats",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 4,
  text: "{X}, {T}: Each creature with mana value X can't attack or block this turn.",
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [],
      // X is bound as the ability resolves, and the restriction stays a
      // filter for the turn, so a creature that enters later with that
      // mana value is caught too (the ruling).
      effect: {
        kind: "restrict",
        filter: { type: "creature", manaValue: { op: "eq", n: { amount: "x" } } },
        restrictions: ["cant-attack", "cant-block"],
      },
      resolve: null,
      text: "{X}, {T}: Each creature with mana value X can't attack or block this turn.",
    },
  ],
});
