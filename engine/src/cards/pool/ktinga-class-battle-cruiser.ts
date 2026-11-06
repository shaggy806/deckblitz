import type { TriggeredAbility } from "../../abilities.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

const FLY_TEXT =
  "Whenever this Spacecraft enters or attacks, one or two target Klingons and/or Warriors you control gain flying until end of turn.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 4+.)";

const KLINGON_OR_WARRIOR: TargetSpec = { kind: "permanent", whose: "you", filter: { subtypes: ["Klingon", "Warrior"] } };

const fly = (trigger: TriggeredAbility["trigger"]): TriggeredAbility => ({
  trigger,
  targets: [KLINGON_OR_WARRIOR, { kind: "optional", of: { kind: "other", of: KLINGON_OR_WARRIOR, than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "flying", duration: "end-of-turn" },
    ],
  },
  resolve: null,
  text: FLY_TEXT,
});

export default defineCard({
  name: "K't'inga-Class Battle Cruiser",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 5,
  toughness: 5,
  text: `${FLY_TEXT}\n${STATION_TEXT}\n4+ | Flying`,
  triggered: [fly({ on: "enters-battlefield", who: "self" }), fly({ on: "attacks", who: "self" })],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(4, {
      addTypes: ["creature"],
      setBasePt: { power: 5, toughness: 5 },
      grantKeywords: ["flying"],
      text: "4+ | Flying",
    }),
  ],
});
