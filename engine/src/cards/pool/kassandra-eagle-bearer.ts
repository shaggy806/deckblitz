import { defineCard } from "../define.js";

const ENTERS =
  "When Kassandra enters, search your graveyard, hand, and library for a card named The Spear of Leonidas, put it onto the battlefield, then shuffle.";
const HIT =
  "Whenever a creature you control with a legendary Equipment attached to it deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Kassandra, Eagle Bearer",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${ENTERS}\n${HIT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        zones: "graveyard-hand-library",
        filter: { name: "The Spear of Leonidas" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { type: "creature", attachments: { filter: { subtype: "Equipment", supertype: "legendary" } } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: HIT,
    },
  ],
});
