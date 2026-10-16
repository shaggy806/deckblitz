import { defineCard } from "../define.js";

// EDHREC rank 15396. Fallout (PIP).
//
// "Enters or dies" is two triggers, each with an optional ("up to one")
// target card in your graveyard.
const TEXT =
  "When this creature enters or dies, return up to one target Aura or Equipment card from your graveyard to your hand.";
const TARGET = {
  kind: "optional",
  of: { kind: "card-in-graveyard", whose: "you", filter: { anyOf: [{ subtype: "Aura" }, { subtype: "Equipment" }] } },
} as const;

export default defineCard({
  name: "Super Mutant Scavenger",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Mutant", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [TARGET],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [TARGET],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
