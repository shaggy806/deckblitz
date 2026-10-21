import { defineCard } from "../define.js";

// EDHREC rank 10419. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] Because damage remains marked on a creature until the damage is removed as the
//     turn ends, nonlethal damage dealt to a Human you control may become lethal if General Kudro
//     leaves the battlefield during that turn.
//   [2020-04-17] Only creatures are Humans. Planeswalkers such as Lukka and Narset who represent
//     human characters won't cause General Kudro's middle ability to trigger.
//   [2020-04-17] General Kudro can be sacrificed to pay the cost of its own last ability. How
//     noble.

// "General Kudro or another Human you control enters" is Lossarnach Captain's
// pair of triggers: itself (whatever its types are by then), and each other
// Human. The sacrifice cost may include Kudro itself (the ruling).
const ANTHEM_TEXT = "Other Humans you control get +1/+1.";
const ENTER_TEXT =
  "Whenever General Kudro or another Human you control enters, exile target card from an opponent's graveyard.";
const DESTROY_TEXT = "{2}, Sacrifice two Humans: Destroy target creature with power 4 or greater.";

const exileFromOpponentsGraveyard = {
  targets: [{ kind: "card-in-graveyard", whose: "opponent" }],
  effect: { kind: "exile", target: 0 },
  resolve: null,
  text: ENTER_TEXT,
} as const;

export default defineCard({
  name: "General Kudro of Drannith",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: `${ANTHEM_TEXT}\n${ENTER_TEXT}\n${DESTROY_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Human", excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, ...exileFromOpponentsGraveyard },
    {
      trigger: { on: "enters-battlefield", who: "you-control", otherOnly: true, filter: { subtype: "Human" } },
      ...exileFromOpponentsGraveyard,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { subtype: "Human" }, count: 2 } },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
