import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// "Each opponent who can't" is one who discarded nothing this way (Liliana,
// Waker of the Dead's shape); the 1+ band's trigger sees those discards too.

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as a sorcery. It's an artifact creature at 8+.)";
const DISCARD_TEXT = "Whenever an opponent discards a card, they lose 3 life.";
const ATTACK_TEXT = "Whenever this Spacecraft attacks, each opponent discards a card. Each opponent who can't loses 3 life.";

export default defineCard({
  name: "Entropic Battlecruiser",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 3,
  toughness: 10,
  text: `${STATION_TEXT}\n1+ | ${DISCARD_TEXT}\n8+ | Flying, deathtouch\n${ATTACK_TEXT}`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded", who: "that-player", atMost: 0 },
              then: { kind: "lose-life", amount: 3, who: "that-player" },
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    stationBand(1, {
      grantsTriggered: [
        {
          trigger: { on: "discards", who: "opponent", perCard: true },
          targets: [],
          effect: { kind: "lose-life", amount: 3, who: "trigger-controller" },
          resolve: null,
          text: DISCARD_TEXT,
        },
      ],
      text: `1+ | ${DISCARD_TEXT}`,
    }),
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 3, toughness: 10 },
      grantKeywords: ["flying", "deathtouch"],
      text: "8+ | Flying, deathtouch",
    }),
  ],
});
