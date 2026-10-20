import { defineCard } from "../define.js";

// EDHREC rank 15046.
//
// Rulings:
//   [2020-11-10] If a creature you control with a +1/+1 counter on it dies at the same time as
//     Alharu, Alharu's ability triggers for that creature.
//   [2020-11-10] You create just one Spirit token, not one for each +1/+1 counter that was on the
//     creature that died.
//   [2020-11-10] If Alharu has a +1/+1 counter on it and dies, its ability triggers for itself.
//
// Angelic Quartermaster's enters trigger and Rayblade Trooper's dies trigger.

const ENTER_TEXT = "When Alharu enters, put a +1/+1 counter on each of up to two other target creatures.";
const DIES_TEXT =
  "Whenever a nontoken creature you control with a +1/+1 counter on it dies, create a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Alharu, Solemn Ritualist",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 3,
  pairing: { kind: "partner" },
  text: `${ENTER_TEXT}\n${DIES_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "other", of: "creature" } },
        { kind: "optional", of: { kind: "other", of: { kind: "other", of: "creature" }, than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
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
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
