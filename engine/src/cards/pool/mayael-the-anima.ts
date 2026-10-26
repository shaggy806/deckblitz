import { defineCard } from "../define.js";

const TEXT =
  "{3}{R}{G}{W}, {T}: Look at the top five cards of your library. You may put a creature card with power 5 or greater from among them onto the battlefield. Put the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Mayael the Anima",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{R}{G}{W}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        min: 0,
        max: 1,
        filter: { type: "creature", power: { op: "gte", n: 5 } },
        destination: "battlefield",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
