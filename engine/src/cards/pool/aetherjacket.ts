import { defineCard } from "../define.js";

const TEXT = "{2}, {T}, Sacrifice this creature: Destroy another target artifact. Activate only as a sorcery.";

export default defineCard({
  name: "Aetherjacket",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 2,
  toughness: 1,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [{ kind: "other", of: "artifact" }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
