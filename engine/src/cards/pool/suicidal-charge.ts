import { defineCard } from "../define.js";

// "Those creatures attack this turn if able": the creatures the -1/-1 reached
// as it resolved (rule 611.2c) — `restrict`'s `asItResolves`.
const TEXT =
  "Sacrifice this enchantment: Creatures your opponents control get -1/-1 until end of turn. Those creatures attack this turn if able.";

export default defineCard({
  name: "Suicidal Charge",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "opponent" },
            power: -1,
            toughness: -1,
            duration: "end-of-turn",
          },
          {
            kind: "restrict",
            filter: { type: "creature", controlledBy: "opponent" },
            asItResolves: true,
            restrictions: ["must-attack"],
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
