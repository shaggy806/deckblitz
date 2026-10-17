import { defineCard } from "../define.js";

// Allons-y!: Kang Prime's shape — every card exiled as it's revealed, the
// nonland one found given the counters and suspend. Timey-Wimey: three time
// travels in a row, each asked once the one before is done.
const ALLONS_Y_TEXT =
  "Allons-y! — Whenever you attack, exile cards from the top of your library until you exile a nonland card. Put three time counters on it. If it doesn't have suspend, it gains suspend.";
const TIMEY_WIMEY_TEXT = "Timey-Wimey — {7}: Time travel three times. Activate only as a sorcery.";

export default defineCard({
  name: "The Tenth Doctor",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 3,
  toughness: 5,
  text: `${ALLONS_Y_TEXT}\n${TIMEY_WIMEY_TEXT} (For each suspended card you own and each permanent you control with a time counter on it, you may add or remove a time counter. Then do it two more times.)`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "reveal-until", filter: { notTypes: ["land"] }, exile: true, rest: "stay" },
          { kind: "give-suspend", timeCounters: 3, filter: { notTypes: ["land"] } },
        ],
      },
      resolve: null,
      text: ALLONS_Y_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{7}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "time-travel" }, { kind: "time-travel" }, { kind: "time-travel" }],
      },
      resolve: null,
      text: TIMEY_WIMEY_TEXT,
      sorcerySpeed: true,
    },
  ],
});
