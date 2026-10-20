import { defineCard } from "../define.js";

// EDHREC rank 22235. A graveyard-zone ability ("activate only if this card is
// in your graveyard"); each row acts on the card only if it's still there.

const TEXT =
  "{3}{G}: Roll a d20. Activate only if this card is in your graveyard.\n1—9 | Put this card on top of your library.\n10—19 | Return this card to your hand.\n20 | Return this card to the battlefield tapped.";

export default defineCard({
  name: "Loathsome Troll",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 6,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "put-on-library", target: "source", position: "top" } },
          { min: 10, max: 19, effect: { kind: "return-to-hand", target: "source", from: "graveyard" } },
          { min: 20, effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
