import { defineCard } from "../define.js";

const FACE_UP =
  "When this land is turned face up, add two mana of any one color. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Branch of Vitu-Ghazi",
  colors: [],
  types: ["land"],
  morph: { keyword: "disguise", cost: "{3}" },
  text: `{T}: Add {C}.\nDisguise {3} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)\n${FACE_UP}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      // "Any one color": two of the one colour chosen (Photon, Mighty Marvel's shape).
      effect: { kind: "add-mana", mana: "any-color", amount: 2, persists: true },
      resolve: null,
      text: FACE_UP,
    },
  ],
});
