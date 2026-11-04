import { defineCard } from "../define.js";

const TAPPED = "Whenever you tap a land for mana while you're the monarch, add an additional one mana of any color.";
const ENTERS = "When this creature enters, you become the monarch.";

export default defineCard({
  name: "Regal Behemoth",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${ENTERS} (You draw a card at the beginning of your end step. Whenever a creature deals combat damage to you, its controller becomes the monarch.)\n${TAPPED}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "tapped-for-mana", who: "you-control", filter: { type: "land" } },
      condition: { kind: "monarch", who: "you" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: TAPPED,
    },
  ],
});
