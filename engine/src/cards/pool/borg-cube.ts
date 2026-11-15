import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import { ASSIMILATE, station, stationBand } from "../helpers.js";

// EDHREC rank 20018.

const AFFINITY_TEXT =
  "Affinity for artifact creatures (This spell costs {1} less to cast for each artifact creature you control.)";
const TRIGGER_TEXT =
  "Whenever this Spacecraft enters or attacks, assimilate a creature card exiled with it. If you can't, exile up to one target creature. (To assimilate a card, put it onto the battlefield under your control with a +1/+1 counter. It's a Borg artifact creature and loses all other creature types.)";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 12+.)";
const BAND_TEXT = "12+ | Artifact creatures you control have flying.";

// "Assimilate a creature card exiled with it. If you can't, exile up to one
// target creature": the target is chosen as the trigger goes on the stack
// (rule 603.3d) and used only when no creature card is exiled with it now.
// The exile is linked (rule 607.2a), so a later trigger assimilates it.
const ASSIMILATE_OR_EXILE: EffectSpec = {
  kind: "conditional",
  condition: { kind: "exiled-with-source", atLeast: 1, now: true, filter: { type: "creature" } },
  then: {
    kind: "look-and-choose",
    zone: "exiled-with-source",
    min: 1,
    max: 1,
    filter: { type: "creature" },
    destination: "battlefield",
    ...ASSIMILATE,
    leftover: "stay",
  },
  else: { kind: "exile", target: 0, linked: true },
};

export default defineCard({
  name: "Borg Cube",
  manaCost: "{5}{W}{B}",
  colors: ["W", "B"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 6,
  toughness: 6,
  text: `${AFFINITY_TEXT}\n${TRIGGER_TEXT}\n${STATION_TEXT}\n${BAND_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { types: ["artifact", "creature"], controlledBy: "you" } },
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: ASSIMILATE_OR_EXILE,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: ASSIMILATE_OR_EXILE,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(12, { addTypes: ["creature"], setBasePt: { power: 6, toughness: 6 }, text: STATION_TEXT }),
    stationBand(
      12,
      { grantKeywords: ["flying"], text: BAND_TEXT },
      { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
    ),
  ],
});
