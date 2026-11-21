import { defineCard } from "../define.js";
import { training } from "../helpers.js";

// Innistrad: Crimson Vow (VOW). EDHREC rank 18320.
//
// One target slot over two zones (`one-of`): a creature on the battlefield, or a creature card in
// any graveyard — "up to one" an `optional` around it, "other" an `other` (only the battlefield
// part could ever be this creature). The exile is linked to this stint (rule 607.2a), so the
// leaves trigger puts back every card it exiled, together, under their owners' control.
const TRAINS_TEXT =
  "Whenever this creature trains, exile up to one other target creature from the battlefield or creature card from a graveyard.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, put the exiled cards onto the battlefield under their owners' control.";

export default defineCard({
  name: "Savior of Ollenbock",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: `Training (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)\n${TRAINS_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    training(),
    {
      trigger: { on: "trains", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "other",
            of: {
              kind: "one-of",
              of: ["creature", { kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
            },
          },
        },
      ],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: TRAINS_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
