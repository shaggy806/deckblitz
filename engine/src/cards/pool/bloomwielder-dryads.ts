import { defineCard } from "../define.js";

const END_TEXT = "At the beginning of your end step, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Bloomwielder Dryads",
  art: "https://cards.scryfall.io/art_crop/back/e/4/e454bf31-5aa0-4109-a3f5-c3f9cc838682.jpg",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 3,
  toughness: 3,
  text: `Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  faces: ["Invasion of Moag", "Bloomwielder Dryads"],
  transform: true,
});
