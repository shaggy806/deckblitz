import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 8236.
//
// "This creature or another creature you control enters" is any creature you
// control entering, itself included (Decoction Module's trigger). The attack
// trigger's target is chosen as it goes on the stack; the {E}{E} is paid as it
// resolves (Scrapper Champion's `costEnergy`), and an empty slot taps nothing.
const ENERGY = "Whenever this creature or another creature you control enters, you get {E} (an energy counter).";
const ATTACK =
  "Whenever this creature attacks, you may pay {E}{E}. If you do, put a +1/+1 counter on it and tap up to one target creature defending player controls.";

export default defineCard({
  name: "Aetherstorm Roc",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENERGY}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "get-energy", amount: 1 },
      resolve: null,
      text: ENERGY,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: "creature-defending-player-controls" }],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to put a +1/+1 counter on this creature and tap the target creature?",
        costEnergy: 2,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            { kind: "tap", target: 0 },
          ],
        },
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
