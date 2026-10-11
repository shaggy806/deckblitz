import { defineCard } from "../define.js";

// EDHREC rank 6792.
//
// "A commander you control" is anyone's commander you control, owned or not
// (Norn's Choirmaster's trigger, and Anara's ruling on the same words), and
// "it" is that attacking commander.
const TEXT = "Whenever a commander you control attacks, put a +1/+1 counter on it.";

export default defineCard({
  name: "Keleth, Sunmane Familiar",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 1,
  toughness: 1,
  pairing: { kind: "partner" },
  text: `${TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { isCommander: true } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
