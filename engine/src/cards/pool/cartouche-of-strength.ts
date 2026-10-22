import { defineCard } from "../define.js";

// Amonkhet. Meltstrider's Resolve's "enchanted creature fights", behind a
// "you may": `attached` reads the creature it last enchanted if the Aura has
// left by then (the ruling).
const ENTERS =
  "When this Aura enters, you may have enchanted creature fight target creature an opponent controls. (Each deals damage equal to its power to the other.)";

export default defineCard({
  name: "Cartouche of Strength",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura", "Cartouche"],
  text: `Enchant creature you control\n${ENTERS}\nEnchanted creature gets +1/+1 and has trample.`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "may",
        prompt: "Have the enchanted creature fight the target creature?",
        effect: { kind: "fight", a: "attached", b: 0 },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: "Enchanted creature gets +1/+1 and has trample.",
    },
  ],
});
