import { defineCard } from "../define.js";

// EDHREC rank 15214.
//
// Rulings:
//   [2025-07-25] If Rayblade Trooper dies at the same time as one or more creatures you control
//     with +1/+1 counters on them, its second ability will trigger for each of those creatures.
//     This includes Rayblade Trooper itself if it had a +1/+1 counter on it when it died.
//
// The dies trigger's filter is read off each creature as it last existed
// (Felisa's shape), itself included.

const ENTER_TEXT = "When this creature enters, put a +1/+1 counter on target creature you control.";
const DIES_TEXT =
  "Whenever a nontoken creature you control with a +1/+1 counter on it dies, create a 1/1 white Human Soldier creature token.";
const WARP_TEXT =
  "Warp {1}{W} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)";

export default defineCard({
  name: "Rayblade Trooper",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${DIES_TEXT}\n${WARP_TEXT}`,
  warp: { cost: "{1}{W}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", token: false, counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
