import { defineCard } from "../define.js";

const TEXT = "Infesting Spores — When this creature enters, destroy up to one target artifact or enchantment.";

export default defineCard({
  name: "Myconid Spore Tender",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 4,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "artifact-or-enchantment" }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
