import { defineCard } from "../define.js";

export default defineCard({
  name: "Goldmeadow Lookout",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Spellshaper"],
  power: 2,
  toughness: 2,
  text: "{W}, {T}, Discard a card: Create a 1/1 white Kithkin Soldier creature token named Goldmeadow Harrier. It has \"{W}, {T}: Tap target creature.\"",
  activated: [
    {
      cost: { mana: "{W}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Goldmeadow Harrier Token", count: 1 },
      resolve: null,
      text: "{W}, {T}, Discard a card: Create a 1/1 white Kithkin Soldier creature token named Goldmeadow Harrier. It has \"{W}, {T}: Tap target creature.\"",
    },
  ],
});
