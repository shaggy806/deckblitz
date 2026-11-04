import { defineCard } from "../define.js";

// Rulings:
//   If something is goaded but the player who goaded it has left the game, it still must attack
//     one of the other players if able.
//
// X is read as it resolves; a library with fewer creatures gives what it has, and then some
// opponents go without. They enter under Dack's controller (their triggers are that player's),
// who goaded them (rule 701.15), and only then change hands, together.
const TEXT =
  "When Dack Fayden enters, reveal cards from the top of your library until you reveal X creature cards, where X is the number of opponents you have. Put those creature cards onto the battlefield, then shuffle. They're goaded for the rest of the game. For each of those permanents, choose a different opponent. Each opponent gains control of the permanent for which they were chosen.";

export default defineCard({
  name: "Dack Fayden, Helping Hand",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 4,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until-count",
        filter: { type: "creature" },
        count: { countPlayers: "each-opponent" },
        rest: "shuffle",
        thenEach: { kind: "goad", target: 0, forGame: true },
        thenToDifferentOpponents: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
