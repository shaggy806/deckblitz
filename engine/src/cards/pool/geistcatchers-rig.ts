import { defineCard } from "../define.js";

const TEXT = "When this creature enters, you may have it deal 4 damage to target creature with flying.";

export default defineCard({
  name: "Geistcatcher's Rig",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: {
        kind: "may",
        prompt: "Have Geistcatcher's Rig deal 4 damage to the targeted creature?",
        effect: { kind: "damage", amount: 4, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
