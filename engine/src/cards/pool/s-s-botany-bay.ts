import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 29999.
//
// Every card the {T} ability exiles, any player's, is exiled with the
// Spacecraft (rule 607.2a — a look-and-choose's exile is linked unless
// `unlinked`). The combat damage trigger follows the 8+ line, so it is part of
// that station symbol's static ability (rule 721.2), and returns only the
// creature cards among them its controller owns.

const EXILE_TEXT = "{T}: Each opponent exiles a card from their graveyard. You may exile a card from your graveyard.";
const RETURN_TEXT =
  "Whenever S.S. Botany Bay deals combat damage to a player, return each creature card you own exiled with it to " +
  "the battlefield.";

export default defineCard({
  name: "S.S. Botany Bay",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 3,
  toughness: 5,
  text: `${EXILE_TEXT}\nStation\n8+ | Flying\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "look-and-choose",
              player: "that-player",
              zone: "graveyard",
              min: 1,
              max: 1,
              destination: "exile",
              leftover: "stay",
            },
          },
          { kind: "look-and-choose", zone: "graveyard", min: 0, max: 1, destination: "exile", leftover: "stay" },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
    station("Station"),
  ],
  static: [
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 3, toughness: 5 },
      grantKeywords: ["flying"],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: {
            kind: "return-exiled-by-source",
            linked: "battlefield",
            filter: { type: "creature", ownedBy: "you" },
          },
          resolve: null,
          text: RETURN_TEXT,
        },
      ],
      text: `8+ | Flying\n${RETURN_TEXT}`,
    }),
  ],
});
