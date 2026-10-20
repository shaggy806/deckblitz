import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 9700.

const ETB_TEXT = "When this Vehicle enters, tap up to one target creature.";

export default defineCard({
  name: "High-Speed Hoverbike",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ETB_TEXT}\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [crew(1)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
