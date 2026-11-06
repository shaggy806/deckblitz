import { defineCard } from "../define.js";

// EDHREC rank 25967.
// "Target Spacecraft": anyone's.

const ENTER_TEXT =
  "When this artifact enters, you may search your library for a basic land card, reveal it, put it into your hand, then shuffle.";
const CHARGE_TEXT = "{1}, {T}: Put two charge counters on target Spacecraft. Activate only as a sorcery.";

export default defineCard({
  name: "Warp Core",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${CHARGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Spacecraft" } }],
      effect: { kind: "add-counter", target: 0, counter: "charge", amount: 2 },
      resolve: null,
      sorcerySpeed: true,
      text: CHARGE_TEXT,
    },
  ],
});
