import { defineCard } from "../define.js";

// EDHREC rank 11523. Lita's shape: the mode is announced as each instance
// goes on the stack (rule 603.3c), so permanents leaving together each take
// a different one, and past the third in a turn there's nothing left to
// choose and the instance does nothing (the rulings). Tracked per ability of
// this Genku, so a second Genku keeps its own. Genku leaving beside the
// others still sees them leave (a leaves trigger looks back, rule 603.10a).
const TRIGGER_TEXT =
  "Whenever another nontoken permanent you control leaves the battlefield, choose one that hasn't been chosen this turn. Create a creature token with those characteristics.";
const FOX_MODE = "2/2 white Fox with vigilance.";
const MOONFOLK_MODE = "1/2 blue Moonfolk with flying.";
const RAT_MODE = "1/1 black Rat with lifelink.";
const COUNTERS_TEXT = "{3}{W}{U}: Put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Genku, Future Shaper",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 2,
  toughness: 5,
  text: `${TRIGGER_TEXT}\n• ${FOX_MODE}\n• ${MOONFOLK_MODE}\n• ${RAT_MODE}\n${COUNTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "you-control", filter: { token: false }, otherOnly: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenThisTurn: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: FOX_MODE, effect: { kind: "create-token", token: "Fox Token", count: 1 } },
          { text: MOONFOLK_MODE, effect: { kind: "create-token", token: "Moonfolk Token", count: 1 } },
          { text: RAT_MODE, effect: { kind: "create-token", token: "Rat Token (Genku, Future Shaper)", count: 1 } },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${FOX_MODE} ${MOONFOLK_MODE} ${RAT_MODE}`,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}{U}", tap: false },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
