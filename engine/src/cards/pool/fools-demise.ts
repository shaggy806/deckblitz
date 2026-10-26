import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 14141.
//
// False Demise's trigger and Brilliant Halo's: each is the Aura's own,
// reading what it needs as it last existed, so when the Aura and its creature
// go to the graveyard together both trigger (the ruling).
//
// Rulings:
//   [2006-09-25] If Fool's Demise and the enchanted creature go to the graveyard from the
//     battlefield at the same time, both abilities will trigger.

const DIES_TEXT = "When enchanted creature dies, return that card to the battlefield under your control.";
const RETURN_TEXT = "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.";

export default defineCard({
  name: "Fool's Demise",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${DIES_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
