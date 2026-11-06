import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 29940.

const ENTER_TEXT =
  "When Enterprise NX-01 enters, tap target creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 6+.)";

export default defineCard({
  name: "Enterprise NX-01",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 3,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n6+ | Flying, vigilance`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(6, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 3 },
      grantKeywords: ["flying", "vigilance"],
      text: "6+ | Flying, vigilance",
    }),
  ],
});
