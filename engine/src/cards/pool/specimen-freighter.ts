import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 14620.
//
// "Up to two" is two optional slots, the second another than the first, and
// both go back at once (Repulsor Bots). A Spacecraft that's a creature isn't
// a non-Spacecraft creature. The attack trigger is the 9+ striation's (rule
// 721.2: every line after a station symbol belongs to it), so the
// Spacecraft has it only at 9+ — not when something else animates it with
// fewer counters.

const ENTER_TEXT =
  "When this Spacecraft enters, return up to two target non-Spacecraft creatures to their owners' hands.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 9+.)";
const ATTACK_TEXT = "Whenever this Spacecraft attacks, defending player mills four cards.";

const NON_SPACECRAFT_CREATURE = { kind: "permanent", filter: { type: "creature", notSubtypes: ["Spacecraft"] } } as const;

export default defineCard({
  name: "Specimen Freighter",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 7,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n9+ | Flying\n${ATTACK_TEXT}`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: NON_SPACECRAFT_CREATURE },
        { kind: "optional", of: { kind: "other", of: NON_SPACECRAFT_CREATURE, than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(9, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 7 },
      grantKeywords: ["flying"],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "mill", target: "trigger-player", amount: 4 },
          resolve: null,
          text: ATTACK_TEXT,
        },
      ],
      text: `9+ | Flying\n${ATTACK_TEXT}`,
    }),
  ],
});
