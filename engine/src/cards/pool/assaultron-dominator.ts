import { defineCard } from "../define.js";

// EDHREC rank 7092.
//
// Rulings:
//   [2024-03-08] If multiple artifact creatures you control attack, Assaultron Dominator’s last
//     ability triggers for each of them.
//   [2024-03-08] Some triggered abilities state that you “may pay” a certain amount of {E}. You
//     can’t pay that amount multiple times to multiply the effect. You simply choose whether or
//     not to pay that amount of {E} as the ability resolves.
//
// The {E} is a `may`'s `costEnergy` (Satya), paid as the ability resolves;
// which counter is chosen then too, as a resolution-time `modal`
// (Inspirit's "your choice of" a counter). Itself included: it's an artifact
// creature you control.
const ENTER_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK_TEXT =
  "Whenever an artifact creature you control attacks, you may pay {E}. If you do, put your choice of a +1/+1, first strike, or trample counter on that creature.";

export default defineCard({
  name: "Assaultron Dominator",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "you-control", filter: { types: ["artifact", "creature"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E} to put a +1/+1, first strike, or trample counter on that creature?",
        costEnergy: 1,
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "A +1/+1 counter",
              effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
            },
            {
              text: "A first strike counter",
              effect: { kind: "add-counter", target: "trigger-object", counter: "first-strike", amount: 1 },
            },
            {
              text: "A trample counter",
              effect: { kind: "add-counter", target: "trigger-object", counter: "trample", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
