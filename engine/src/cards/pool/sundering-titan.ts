import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

const TEXT = "When this creature enters or leaves the battlefield, choose a land of each basic land type, then destroy those lands.";

/** Not targeted: chosen as it resolves, among every player's lands, and
 * destroyed together. A land of more than one type can be chosen more than
 * once, and a type only you have must be yours (the rulings). */
const DESTROY: EffectSpec = {
  kind: "choose-one-of-each",
  who: "you",
  slots: "basic-land-types",
  filter: { type: "land" },
  anyController: true,
  chosen: "destroy",
  prompt: "Choose a land of each basic land type to destroy",
};

export default defineCard({
  name: "Sundering Titan",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 7,
  toughness: 10,
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: DESTROY, resolve: null, text: TEXT },
    { trigger: { on: "leaves-battlefield", who: "self" }, targets: [], effect: DESTROY, resolve: null, text: TEXT },
  ],
});
