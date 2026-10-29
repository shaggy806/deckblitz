import { defineCard } from "../define.js";

// The exiled card is linked to this stint of the Sculler (rule 607.2a): if it
// leaves before its enters ability resolves, the leaves ability returns
// nothing and the card is then exiled for good (the ruling).
const ENTERS = "When this creature enters, target opponent reveals their hand and you choose a nonland card from it. Exile that card.";
const LEAVES = "When this creature leaves the battlefield, return the exiled card to its owner's hand.";

export default defineCard({
  name: "Tidehollow Sculler",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: `${ENTERS}\n${LEAVES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: LEAVES,
    },
  ],
});
