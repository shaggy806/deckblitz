import { defineCard } from "../define.js";

// The second ability is a mana ability though it rolls (the ruling); the
// trigger's value is the result, the natural total plus any modifier (706.2).
const ROLL_TEXT = "Whenever you roll one or more dice, put a number of charge counters on this artifact equal to the result.";

export default defineCard({
  name: "Vexing Puzzlebox",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${ROLL_TEXT}\n{T}: Add one mana of any color. Roll a d20.\n{T}, Remove 100 charge counters from this artifact: Search your library for an artifact card, put that card onto the battlefield, then shuffle.`,
  triggered: [
    {
      trigger: { on: "event", event: "rolls-dice", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: { triggerValue: true } },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1, also: { kind: "roll-dice", sides: 20 } },
      resolve: null,
      text: "{T}: Add one mana of any color. Roll a d20.",
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 100 } },
      targets: [],
      effect: { kind: "search-library", filter: { type: "artifact" }, destination: "battlefield", min: 0, max: 1 },
      resolve: null,
      text: "{T}, Remove 100 charge counters from this artifact: Search your library for an artifact card, put that card onto the battlefield, then shuffle.",
    },
  ],
});
