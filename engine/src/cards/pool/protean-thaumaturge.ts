import { defineCard } from "../define.js";

export default defineCard({
  name: "Protean Thaumaturge",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "Constellation — Whenever an enchantment you control enters, you may have this creature become a copy of another target creature, except it has this ability.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "may",
        prompt: "Have Protean Thaumaturge become a copy of another target creature, except it has this ability?",
        effect: {
          kind: "become-copy",
          target: "source",
          of: 0,
          exceptions: { thisAbility: { card: "Protean Thaumaturge", triggered: 0 } },
        },
      },
      resolve: null,
      text: "Constellation — Whenever an enchantment you control enters, you may have this creature become a copy of another target creature, except it has this ability.",
    },
  ],
});
