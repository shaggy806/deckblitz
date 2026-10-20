import { defineCard } from "../define.js";

// EDHREC rank 11772. Commander Legends (CMR).
//
// "Equal to its power" is read as Nadier last existed on the battlefield
// (the ruling; `powerOf: "source"` on a source that has left is its
// last-known information, as Goldvein Hydra's dies trigger reads it).
//
// Rulings:
//   [2020-11-10] For Nadier's second ability, use its power from when it was last on the
//     battlefield to determine how many tokens to create.

const TOKEN_TEXT = "Whenever a token you control leaves the battlefield, put a +1/+1 counter on Nadier.";
const LEAVE_TEXT =
  "When Nadier leaves the battlefield, create a number of 1/1 green Elf Warrior creature tokens equal to its power.";

export default defineCard({
  name: "Nadier, Agent of the Duskenel",
  manaCost: "{5}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  pairing: { kind: "partner" },
  text: `${TOKEN_TEXT}\n${LEAVE_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "you-control", filter: { token: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Elf Warrior Token", count: { powerOf: "source" } },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
