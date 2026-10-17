import { defineCard } from "../define.js";

// "Each Human you control": every Human permanent, not only creatures.
const ATTACK_TEXT = "Whenever Karvanista attacks, put a +1/+1 counter on each Human you control.";

export default defineCard({
  name: "Karvanista, Loyal Lupari",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Alien", "Dog", "Soldier"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance", "trample", "haste"],
  text: `Vigilance, trample, haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Human", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Karvanista, Loyal Lupari", "Lupari Shield"],
  adventure: true,
});
