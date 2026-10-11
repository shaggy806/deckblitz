import { defineCard } from "../define.js";

// Reality Fracture Commander (FRC). EDHREC rank 11277.
//
// Rulings:
//   [2026-08-21] The last ability of Ob Nixilis will trigger if you gained any amount of life this
//     turn, even if you also lost life during the same turn. For example, if you gained 2 life this
//     turn but also lost 4 life, you will still create an Angel token.
//
// Fumigate's count of what was destroyed (an indestructible or regenerated
// creature wasn't), and Angelic Accord's intervening-if at "1 or more".

const ENTERS_TEXT =
  "When Ob Nixilis enters, destroy all tapped creatures your opponents control. You gain 1 life for each creature destroyed this way.";
const ANGEL_TEXT =
  "At the beginning of each end step, if you gained life this turn, create a 4/4 white Angel creature token with flying.";

export default defineCard({
  name: "Ob Nixilis, the Ascended",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}\n${ANGEL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy-all", filter: { type: "creature", tapped: true, controlledBy: "opponent" } },
          { kind: "gain-life", amount: { thisWay: "destroyed" } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "4/4 Angel Token", count: 1 },
      resolve: null,
      text: ANGEL_TEXT,
    },
  ],
});
