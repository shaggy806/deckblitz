import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// Star Trek Commander (TRC). The artifact cards are picked from among the
// milled ones (`thisWay: "milled"`, Silvan Rally's shape).

const ETB_TEXT =
  "When this Spacecraft enters, mill five cards. You may put up to two artifact cards from among them into your hand.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as a sorcery.)";
const TAP_TEXT = "{T}: Target creature can't be blocked this turn.";

export default defineCard({
  name: "Transwarp Hub",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  text: `${ETB_TEXT}\n${STATION_TEXT}\n3+ | ${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 5 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 2,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", type: "artifact" },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(3, {
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          resolve: null,
          text: TAP_TEXT,
        },
      ],
      text: `3+ | ${TAP_TEXT}`,
    }),
  ],
});
