import { defineCard } from "../define.js";

// Fallen Empires (FEM). EDHREC rank 19174.
//
// Rulings:
//   Whether or not it is tapped is checked at the beginning of upkeep. If it is not tapped, the
//     ability does not trigger. It also checks during resolution and you only get a counter if it
//     is still tapped then.
//   Counters are not lost if the land is changed to another land type. They wait around for the
//     land to change back.
//   If the land is tapped by some external effect, no counters are removed from it.
//
// A storage land: the upkeep trigger's "if this land is tapped" is an
// intervening if (rule 603.4), and "remove any number of storage counters"
// announces X as it's activated (`removeCounter`'s `count: "x"`, 0 allowed),
// making {G} X times.

const ENTERS = "This land enters tapped.";
const UNTAP = "You may choose not to untap this land during your untap step.";
const UPKEEP = "At the beginning of your upkeep, if this land is tapped, put a storage counter on it.";
const MANA = "{T}, Remove any number of storage counters from this land: Add {G} for each storage counter removed this way.";

export default defineCard({
  name: "Hollow Trees",
  colors: [],
  types: ["land"],
  text: `${ENTERS}\n${UNTAP}\n${UPKEEP}\n${MANA}`,
  static: [
    { affects: { scope: "self" }, replacement: { event: "enters-battlefield", tapped: true }, text: ENTERS },
    { affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source", filter: { tapped: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "storage", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "storage", count: "x" } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: "x" },
      resolve: null,
      text: MANA,
    },
  ],
});
