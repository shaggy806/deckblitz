import { defineCard } from "../define.js";

// EDHREC rank 27085.

export default defineCard({
  name: "Soul-Guide Gryff",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Hippogriff", "Spirit"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, exile up to one target card from a graveyard.",
  triggered: [
    {
      resolve: null,
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
      effect: { kind: "exile", target: 0 },
      text: "When this creature enters, exile up to one target card from a graveyard.",
    },
  ],
});
