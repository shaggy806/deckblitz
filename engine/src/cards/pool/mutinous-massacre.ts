import { defineCard } from "../define.js";

const CREATURES = { type: "creature" } as const;

export default defineCard({
  name: "Mutinous Massacre",
  manaCost: "{3}{B}{B}{R}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Choose odd or even. Destroy each creature with mana value of the chosen quality. Then gain control of all creatures until end of turn. Untap them. They gain haste until end of turn. (Zero is even.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-creature-type",
        options: ["odd", "even"],
        prompt: "Choose odd or even",
        then: { kind: "destroy-all", filter: { type: "creature", manaValueParity: "$chosen" } },
      },
      { kind: "gain-control-all", filter: CREATURES, untilEndOfTurn: true },
      // "Untap them" is every creature, those you already controlled too (its ruling).
      { kind: "untap-all", filter: CREATURES },
      { kind: "grant-keyword-all", filter: CREATURES, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
