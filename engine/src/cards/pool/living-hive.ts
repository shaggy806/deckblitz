import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 11709. Tana, the Bloodsower's trigger with
// Insects.

const TEXT = "Whenever this creature deals combat damage to a player, create that many 1/1 green Insect creature tokens.";

export default defineCard({
  name: "Living Hive",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Insect"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Insect Token", count: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
