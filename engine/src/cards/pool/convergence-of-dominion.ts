import { defineCard } from "../define.js";

const NODE =
  "Dynastic Command Node — As long as you control your commander, activated abilities of cards in your graveyard cost {2} less " +
  "to activate. This effect can't reduce the mana in that ability's activation cost to less than one mana.";
const PROTOCOLS = "Translocation Protocols — {3}, {T}: Mill three cards.";

// The reduction reaches a card's ability while that card is in its owner's
// graveyard (`anyZone`, `inZone`), priced before the cost moves it (rule
// 601.2f by way of 602.2b): unearth, embalm, a Reassembling Skeleton's
// return. It gives no card an ability it didn't have (the ruling).
export default defineCard({
  name: "Convergence of Dominion",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${NODE}\n${PROTOCOLS}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { isCommander: true, controlledBy: "you", ownedBy: "you" }, atLeast: 1 },
      abilityCostModification: {
        applies: { inZone: "graveyard", ownedBy: "you" },
        anyZone: true,
        reduceGeneric: 2,
        leavesOneMana: true,
      },
      text: NODE,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: PROTOCOLS,
    },
  ],
});
