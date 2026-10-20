import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

const DIES_TEXT =
  "Whenever Miara or another Elf you control dies, you may pay {1} and 1 life. If you do, draw a card.";

// Once per resolution: {1} and 1 life for one card (the ruling).
const PAY_TO_DRAW: EffectSpec = {
  kind: "may",
  prompt: "Pay {1} and 1 life to draw a card?",
  cost: "{1}",
  costLife: 1,
  effect: { kind: "draw", amount: 1 },
};

export default defineCard({
  name: "Miara, Thorn of the Glade",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 1,
  toughness: 2,
  text: `${DIES_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  pairing: { kind: "partner" },
  triggered: [
    // Miara herself, whatever her types; then each other Elf.
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: PAY_TO_DRAW,
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Elf" }, otherOnly: true },
      targets: [],
      effect: PAY_TO_DRAW,
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
