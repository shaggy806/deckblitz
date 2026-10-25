import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 20683.

const ENTER =
  "When this artifact enters, scry 2, then you get {E}{E}. (You get two energy counters. To scry 2, look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)";
const SAC = "{2}{U}, Sacrifice this artifact: Scry 2, then you get {E}{E}.";

const SCRY_ENERGY: EffectSpec = { kind: "scry", amount: 2, then: { kind: "get-energy", amount: 2 } };

export default defineCard({
  name: "Glassblower's Puzzleknot",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER}\n${SAC}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: SCRY_ENERGY,
      resolve: null,
      text: ENTER,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false, sacrifice: "self" },
      targets: [],
      effect: SCRY_ENERGY,
      resolve: null,
      text: SAC,
    },
  ],
});
