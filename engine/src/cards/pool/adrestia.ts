import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// - "If an Assassin crewed it this turn" is an intervening if (rule 603.4): a creature that was an
//   Assassin as it was tapped to pay this Vehicle's crew cost this turn (702.122c; the rulings),
//   even one that has left the battlefield or stopped being an Assassin since. Crewing it after it
//   attacks is too late. Both the draw and becoming an Assassin are under it.
// - A Vehicle that left and came back is a new object, crewed by nothing yet (rule 400.7).

const ATTACK =
  "Whenever Adrestia attacks, if an Assassin crewed it this turn, draw a card. Adrestia becomes an Assassin in addition to its other types until end of turn.";

export default defineCard({
  name: "Adrestia",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  keywords: ["islandwalk"],
  text: `Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\n${ATTACK}\n${crewText(1)}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "turn-history",
        what: "crewers",
        who: "any-player",
        filter: { subtype: "Assassin" },
        ofSelf: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "become", target: "source", addSubtypes: ["Assassin"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK,
    },
  ],
  activated: [crew(1, crewText(1))],
});
