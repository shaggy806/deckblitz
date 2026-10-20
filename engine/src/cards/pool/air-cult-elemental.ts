import { defineCard } from "../define.js";

// EDHREC rank 24088. "Whirlwind" is an ability word: flavor only.

const ETB_TEXT = "Whirlwind — When this creature enters, return up to one other target creature to its owner's hand.";

export default defineCard({
  name: "Air-Cult Elemental",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
