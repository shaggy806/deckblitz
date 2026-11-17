import { defineCard } from "../define.js";

const REDUCE = "Activated abilities of creature cards in your graveyard cost {1} less to activate.";
const MILL = "Tap an untapped Zombie you control: Target player mills a card.";

// A creature card's ability while it's in its owner's graveyard (`anyZone`,
// `inZone`): embalm, eternalize, unearth, scavenge — priced before the cost
// exiles it (rules 602.2b, 601.2f). Generic mana only, never below {0}.
export default defineCard({
  name: "Embalmer's Tools",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${REDUCE}\n${MILL}`,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: {
        applies: { type: "creature", inZone: "graveyard", ownedBy: "you" },
        anyZone: true,
        reduceGeneric: 1,
      },
      text: REDUCE,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { subtype: "Zombie", controlledBy: "you" }, includeSelf: true },
      },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 1 },
      resolve: null,
      text: MILL,
    },
  ],
});
