import { defineCard } from "../define.js";

// EDHREC rank 8593.
//
// "Waterbend {3}, {T}": the {T} taps the Patrol itself, so it can't also be
// one of the permanents tapped to help pay the waterbend part.

const UNTAP_TEXT = "{T}: Untap another target permanent you control.";
const BEND_TEXT = "Waterbend {3}, {T}: Tap target creature an opponent controls.";

export default defineCard({
  name: "North Pole Patrol",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 2,
  toughness: 3,
  text: `${UNTAP_TEXT}\n${BEND_TEXT} (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: {} } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: UNTAP_TEXT,
    },
    {
      cost: { mana: "{3}", tap: true, waterbend: true },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: BEND_TEXT,
    },
  ],
});
