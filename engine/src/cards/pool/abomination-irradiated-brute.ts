import { defineCard } from "../define.js";

// EDHREC rank 18430. Marvel Super Heroes Commander.
//
// Necropolis Regent's per-creature combat-damage trigger, the counters going
// on Abomination itself ("that many" is the damage dealt — `triggerValue`).
// Abomination is a Gamma and a Villain, so its own damage counts too.
const TEXT =
  "Whenever a Gamma or Villain you control deals combat damage to a player, put that many +1/+1 counters on Abomination.";

export default defineCard({
  name: "Abomination, Irradiated Brute",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gamma", "Villain"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { anyOf: [{ subtype: "Gamma" }, { subtype: "Villain" }] },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
