import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const GOAD_TEXT = "When this creature enters, for each opponent, goad target creature that player controls.";
const MENACE_TEXT =
  "Whenever one or more creatures attack one of your opponents, those creatures gain menace until end of turn.";

// One slot for each opponent by seat (Turf War's shape).
const creatureAtSeat = (seat: number): TargetSpec => ({
  kind: "permanent",
  whose: { seat },
  filter: { type: "creature" },
});

export default defineCard({
  name: "Frenzied Gorespawn",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  text: `${GOAD_TEXT} (Until your next turn, those creatures attack each combat if able and attack a player other than you if able.)\n${MENACE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [creatureAtSeat(1), creatureAtSeat(2), creatureAtSeat(3)],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "goad", target: 0 },
          { kind: "goad", target: 1 },
          { kind: "goad", target: 2 },
        ],
      },
      resolve: null,
      text: GOAD_TEXT,
    },
    {
      trigger: { on: "attacks-player", who: "any", defender: "opponent" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { inSet: "trigger-batch" },
        keyword: "menace",
        duration: "end-of-turn",
      },
      resolve: null,
      text: MENACE_TEXT,
    },
  ],
});
