import { defineCard } from "../define.js";

// EDHREC rank 16907.
const ABILITY_TEXT =
  "{2}, {T}: Choose target creature card in your graveyard that was put there from the battlefield this turn. Return it to the battlefield tapped.";

export default defineCard({
  name: "Othelm, Sigardian Outcast",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  pairing: { kind: "partner-group", group: "Friends forever" },
  text: `${ABILITY_TEXT}\nPartner—Friends forever (You can have two commanders if both have this ability.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
