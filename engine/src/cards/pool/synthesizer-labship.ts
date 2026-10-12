import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 11217.
//
// Rulings:
//   [2025-07-25] The resulting artifact creature will be able to attack if it’s been under your
//     control continuously since the turn began. That is, it doesn’t matter how long it’s been a
//     creature, just how long it’s been on the battlefield.
//   [2025-07-25] If Synthesizer Labship’s second ability causes a Vehicle to become an artifact
//     creature, it doesn’t count as “crewing” that Vehicle for any ability that would trigger due
//     to a Vehicle becoming crewed.
//   [2025-07-25] If the target of Synthesizer Labship’s second ability was already a creature, its
//     base power and toughness will become 2/2 until end of turn. This overwrites any previous
//     effects that set its base power and/or toughness to specific values. Any power- or
//     toughness-setting effects that start to apply after Synthesizer Labship’s second ability
//     resolves will overwrite this effect. Effects that otherwise modify the target’s power and
//     toughness, including +1/+1 counters, will still apply no matter when they took effect.
//   [2025-07-25] If Synthesizer Labship’s second ability causes a Vehicle to become an artifact
//     creature, its base power and toughness will be set to 2/2. Crewing that Vehicle will not
//     restore its power and toughness. Similarly, if the ability causes a permanent with station
//     to become an artifact creature, putting an amount of charge counters on it greater than or
//     equal to the amount required for it to become an artifact creature won’t overwrite the base
//     power and toughness set by Synthesizer Labship’s second ability.

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 9+.)";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, up to one other target artifact you control becomes an artifact " +
  "creature with base power and toughness 2/2 and gains flying until end of turn.";

export default defineCard({
  name: "Synthesizer Labship",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 4,
  text: `${STATION_TEXT}\n2+ | ${COMBAT_TEXT}\n9+ | Flying, vigilance`,
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(2, {
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "begin-combat", who: "you" },
          targets: [
            {
              kind: "optional",
              of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "artifact" } } },
            },
          ],
          // A layer-7b base P/T set with its own timestamp: it beats a
          // station band's or a crewed Vehicle's printed size (the rulings).
          effect: {
            kind: "animate",
            target: 0,
            power: 2,
            toughness: 2,
            addTypes: ["artifact", "creature"],
            addSubtypes: [],
            keywords: ["flying"],
            duration: "end-of-turn",
          },
          resolve: null,
          text: COMBAT_TEXT,
        },
      ],
      text: `2+ | ${COMBAT_TEXT}`,
    }),
    stationBand(9, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["flying", "vigilance"],
      text: "9+ | Flying, vigilance",
    }),
  ],
});
