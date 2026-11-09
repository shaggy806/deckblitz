import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 26108.
//
// Picard Maneuver follows the 6+ line, so it is part of that station symbol's
// static ability (rule 721.2), as Sledge-Class Seedship's attack trigger is.
// The token attacks a player or planeswalker of its controller's choice
// (rule 508.4), and leaves at end of combat as Geist of Saint Traft's Angel does.

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 6+.)";
const MANEUVER_TEXT =
  "Picard Maneuver — Whenever U.S.S. Stargazer attacks, create a tapped and attacking 4/3 colorless Spacecraft " +
  "Illusion artifact creature token with flying. Exile that token at end of combat.";

export default defineCard({
  name: "U.S.S. Stargazer, Here and There",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 3,
  text: `${STATION_TEXT}\n6+ | Flying\n${MANEUVER_TEXT}`,
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(6, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 3 },
      grantKeywords: ["flying"],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "create-token", token: "Spacecraft Illusion Token", count: 1, tapped: true, attacking: "choose" },
              {
                kind: "delayed-trigger",
                at: { step: "end-combat" },
                about: "created",
                effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 } },
                text: "Exile that token.",
              },
            ],
          },
          resolve: null,
          text: MANEUVER_TEXT,
        },
      ],
      text: `6+ | Flying\n${MANEUVER_TEXT}`,
    }),
  ],
});
