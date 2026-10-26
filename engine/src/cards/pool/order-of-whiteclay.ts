import { defineCard } from "../define.js";

// EDHREC rank 14022.

export default defineCard({
  name: "Order of Whiteclay",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Cleric"],
  power: 1,
  toughness: 4,
  text: "{1}{W}{W}, {Q}: Return target creature card with mana value 3 or less from your graveyard to the battlefield. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{1}{W}{W}", tap: false, untap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: "{1}{W}{W}, {Q}: Return target creature card with mana value 3 or less from your graveyard to the battlefield.",
    },
  ],
});
