import { defineCard } from "../define.js";

// EDHREC rank 14709.
//
// Rulings: the turn order set at the start of the game runs the other way
// from now on, for everything that follows it (who goes next, who chooses
// first); reversed again, it's back to the first. During an extra turn, the
// next turn that isn't one goes on from the last player who took one that
// wasn't; extra turns already waiting keep their order. At two players it
// changes nothing. The seating doesn't move, so "the player to your left"
// is who it was.

const ACTIVATED =
  "{T}, Exile this artifact: Reverse the game's turn order. (For example, if play had proceeded clockwise around the table, it now goes counterclockwise.)";

export default defineCard({
  name: "Aeon Engine",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${ACTIVATED}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: { kind: "reverse-turn-order" },
      resolve: null,
      text: ACTIVATED,
    },
  ],
});
