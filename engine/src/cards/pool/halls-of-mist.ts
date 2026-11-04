import { cumulativeUpkeep } from "../helpers.js";
import { defineCard } from "../define.js";

// Their controller's last turn is read as the attack is declared: the turn before
// the one under way, whoever controlled the creature then.
const TEXT = "Creatures that attacked during their controller's last turn can't attack.";

export default defineCard({
  name: "Halls of Mist",
  colors: [],
  types: ["land"],
  text: `Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${TEXT}`,
  triggered: [cumulativeUpkeep("{1}")],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attackedDuringControllersLastTurn: true } },
      restrictions: ["cant-attack"],
      text: TEXT,
    },
  ],
});
