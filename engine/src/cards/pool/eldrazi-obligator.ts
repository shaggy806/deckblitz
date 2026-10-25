import { defineCard } from "../define.js";

const CAST_TEXT =
  "When you cast this spell, you may pay {1}{C}. If you do, gain control of target creature until end of turn, untap that creature, and it gains haste until end of turn. ({C} represents colorless mana.)";

export default defineCard({
  name: "Eldrazi Obligator",
  manaCost: "{2}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 3,
  toughness: 1,
  keywords: ["haste"],
  text: `Devoid (This card has no color.)\n${CAST_TEXT}\nHaste`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {1}{C} to gain control of that creature until end of turn?",
        cost: "{1}{C}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-control", target: 0, untilEndOfTurn: true },
            { kind: "untap", target: 0 },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
