import { defineCard } from "../define.js";

export default defineCard({
  name: "Patrol Signaler",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 1,
  toughness: 1,
  text: "{1}{W}, {Q}: Create a 1/1 white Kithkin Soldier creature token. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, untap: true },
      targets: [],
      effect: { kind: "create-token", token: "Kithkin Soldier Token", count: 1 },
      resolve: null,
      text: "{1}{W}, {Q}: Create a 1/1 white Kithkin Soldier creature token.",
    },
  ],
});
