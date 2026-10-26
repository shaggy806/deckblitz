import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 31111.
//
// Rulings:
//   [2004-10-04] Switching blockers will not re-trigger this since it only triggers on becoming
//     blocked and switching does not unblock and reblock it.
//   [2004-10-04] If it manages to block or become blocked more than once in a turn, it can get
//     the bonus twice.
// Raging Gorilla's two triggers.

const TEXT = "Whenever this creature blocks or becomes blocked, it gets +2/-2 until end of turn.";
const PUMP = {
  kind: "modify-pt",
  target: "source",
  power: 2,
  toughness: -2,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Dromosaur",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
    { trigger: { on: "becomes-blocked", who: "self" }, targets: [], effect: PUMP, resolve: null, text: TEXT },
  ],
});
