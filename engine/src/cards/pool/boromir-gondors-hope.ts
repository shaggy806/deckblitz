import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 6775.
//
// Adaptive Omnitool's dig, on both an enters and an attacks trigger
// (Anikthea's pair), with "a Human or artifact card" as an `anyOf`.
const TEXT =
  "Whenever Boromir enters or attacks, look at the top six cards of your library. You may reveal a Human or " +
  "artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a " +
  "random order.";

const DIG: EffectSpec = {
  kind: "look-and-choose",
  zone: "library",
  count: 6,
  reveal: "chosen",
  min: 0,
  max: 1,
  filter: { anyOf: [{ subtype: "Human" }, { type: "artifact" }] },
  destination: "hand",
  leftover: "bottom-random",
};

export default defineCard({
  name: "Boromir, Gondor's Hope",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: DIG,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: DIG,
      resolve: null,
      text: TEXT,
    },
  ],
});
