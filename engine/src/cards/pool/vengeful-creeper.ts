import { defineCard } from "../define.js";

const DISGUISE_TEXT =
  "Disguise {5}{G} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";
const FACE_UP_TEXT = "When this creature is turned face up, destroy target artifact or enchantment an opponent controls.";

export default defineCard({
  name: "Vengeful Creeper",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Elemental"],
  power: 5,
  toughness: 5,
  text: `${DISGUISE_TEXT}\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{5}{G}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
