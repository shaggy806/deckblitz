import { defineCard } from "../define.js";

// EDHREC rank 7398.
//
// Its toughness pays crew and saddle (rules 702.122a, 702.171a), never
// teamwork. Tapped for either during your turn, it untaps — once a turn: the
// trigger condition is "during your turn" (`condition`), and only a trigger
// that fires uses up the turn's one (`oncePerTurn`).
const PILOT_TEXT = "This creature saddles Mounts and crews Vehicles using its toughness rather than its power.";
const UNTAP_TEXT = "Whenever this creature becomes tapped during your turn, untap it. This ability triggers only once each turn.";

export default defineCard({
  name: "Interface Ace",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Pilot"],
  power: 0,
  toughness: 4,
  text: `${PILOT_TEXT}\n${UNTAP_TEXT}`,
  static: [{ affects: { scope: "self" }, crewsAs: { toughness: true, saddles: true }, text: PILOT_TEXT }],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      condition: { kind: "your-turn" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
