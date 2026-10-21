import { defineCard } from "../define.js";

// EDHREC rank 30187.
//
// Rulings:
//   [2004-10-04] In multiplayer games you can choose a different player's creature each upkeep.
//     You are forced to pick a creature that some opponent controls if there is a legal target.
//
// "Until your next upkeep" is the `"until-your-next-turn"` duration: the two end at different
// moments of your next turn's untap step and upkeep's start, between which no player gets
// priority and no creature can attack or block, so nothing can see the difference.

const TEXT =
  "At the beginning of your upkeep, target non-Wall creature an opponent controls gains forestwalk until your next upkeep.";

export default defineCard({
  name: "Erhnam Djinn",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 4,
  toughness: 5,
  text: `${TEXT} (It can't be blocked as long as defending player controls a Forest.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Wall"], controlledBy: "opponent" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "forestwalk", duration: "until-your-next-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
