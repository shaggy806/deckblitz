import { defineCard } from "../define.js";

const PROLIFERATE_TEXT = "Whenever an opponent commits a crime, proliferate.";

// A crime is targeting one of *their* opponents — not necessarily this
// creature's controller, in a multiplayer game.
export default defineCard({
  name: "Patrolling Peacemaker",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Soldier"],
  power: 0,
  toughness: 0,
  text: `This creature enters with two +1/+1 counters on it.\n${PROLIFERATE_TEXT} (They commit a crime if they target an opponent, anything an opponent controls, and/or cards in an opponent's graveyard. To proliferate, you choose any number of permanents and/or players, then give each another counter of each kind already there.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "crime-committed", who: "opponent" },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: PROLIFERATE_TEXT,
    },
  ],
});
