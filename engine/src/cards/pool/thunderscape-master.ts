import { defineCard } from "../define.js";

export default defineCard({
  name: "Thunderscape Master",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{B}{B}, {T}: Target player loses 2 life and you gain 2 life.\n{G}{G}, {T}: Creatures you control get +2/+2 until end of turn.",
  activated: [
    {
      cost: { mana: "{B}{B}", tap: true },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
      },
      resolve: null,
      text: "{B}{B}, {T}: Target player loses 2 life and you gain 2 life.",
    },
    {
      cost: { mana: "{G}{G}", tap: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{G}{G}, {T}: Creatures you control get +2/+2 until end of turn.",
    },
  ],
});
