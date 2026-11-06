import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 26257.
//
// One ability with two trigger events (`sameAbilityAs`). "Dies" is any
// permanent put into a graveyard from the battlefield (rule 700.4), so it
// triggers whether or not the Spacecraft is a creature then.

const TRIGGER_TEXT =
  "When U.S.S. Enterprise-C enters or dies, you may discard your hand. If you do, draw a card for each card " +
  "discarded this way.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 3+.)";

const REFILL: EffectSpec = {
  kind: "may",
  prompt: "Discard your hand, then draw a card for each card discarded this way?",
  effect: { kind: "discard-hand", who: "you" },
  then: { kind: "draw", amount: { thisWay: "discarded", who: "you" } },
};

export default defineCard({
  name: "U.S.S. Enterprise-C, Time-Tossed",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 6,
  toughness: 6,
  text: `${TRIGGER_TEXT}\n${STATION_TEXT}\n3+ | Flying`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: REFILL, resolve: null, text: TRIGGER_TEXT },
    {
      trigger: { on: "dies", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: REFILL,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(3, {
      addTypes: ["creature"],
      setBasePt: { power: 6, toughness: 6 },
      grantKeywords: ["flying"],
      text: "3+ | Flying",
    }),
  ],
});
