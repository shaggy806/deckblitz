import { defineCard } from "../define.js";

// EDHREC rank 18721.
//
// Rulings:
//   [2024-02-02] You may target an Equipment card that can't legally be attached to Magnetic
//     Snuffler with its first ability. If you do, it will enter the battlefield unattached.

export default defineCard({
  name: "Magnetic Snuffler",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, return target Equipment card from your graveyard to the battlefield attached to this creature.\nWhenever you sacrifice an artifact, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Equipment" } }],
      // One that can't equip it, or with it gone, enters unattached (the
      // ruling; rule 301.5e).
      effect: { kind: "put-onto-battlefield", target: 0, attachedTo: "source" },
      resolve: null,
      text: "When this creature enters, return target Equipment card from your graveyard to the battlefield attached to this creature.",
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you sacrifice an artifact, put a +1/+1 counter on this creature.",
    },
  ],
});
