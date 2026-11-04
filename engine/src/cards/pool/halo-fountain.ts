import { defineCard } from "../define.js";

export default defineCard({
  name: "Halo Fountain",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: "{W}, {T}, Untap a tapped creature you control: Create a 1/1 green and white Citizen creature token.\n{W}{W}, {T}, Untap two tapped creatures you control: Draw a card.\n{W}{W}{W}{W}{W}, {T}, Untap fifteen tapped creatures you control: You win the game.",
  activated: [
    {
      cost: { mana: "{W}", tap: true, untapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" } } },
      targets: [],
      effect: { kind: "create-token", token: "Citizen Token", count: 1 },
      resolve: null,
      text: "{W}, {T}, Untap a tapped creature you control: Create a 1/1 green and white Citizen creature token.",
    },
    {
      cost: { mana: "{W}{W}", tap: true, untapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{W}{W}, {T}, Untap two tapped creatures you control: Draw a card.",
    },
    {
      cost: { mana: "{W}{W}{W}{W}{W}", tap: true, untapOthers: { count: 15, filter: { type: "creature", controlledBy: "you" } } },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: "{W}{W}{W}{W}{W}, {T}, Untap fifteen tapped creatures you control: You win the game.",
    },
  ],
});
