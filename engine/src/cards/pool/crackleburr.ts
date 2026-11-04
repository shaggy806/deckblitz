import { defineCard } from "../define.js";

export default defineCard({
  name: "Crackleburr",
  manaCost: "{1}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: "{U/R}{U/R}, {T}, Tap two untapped red creatures you control: This creature deals 3 damage to any target.\n{U/R}{U/R}, {Q}, Untap two tapped blue creatures you control: Return target creature to its owner's hand. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: {
        mana: "{U/R}{U/R}",
        tap: true,
        tapOthers: { count: 2, filter: { type: "creature", colors: ["R"], controlledBy: "you" } },
      },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: 3 },
      resolve: null,
      text: "{U/R}{U/R}, {T}, Tap two untapped red creatures you control: This creature deals 3 damage to any target.",
    },
    {
      cost: {
        mana: "{U/R}{U/R}",
        tap: false,
        untap: true,
        untapOthers: { count: 2, filter: { type: "creature", colors: ["U"], controlledBy: "you" } },
      },
      targets: ["creature"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "{U/R}{U/R}, {Q}, Untap two tapped blue creatures you control: Return target creature to its owner's hand.",
    },
  ],
});
