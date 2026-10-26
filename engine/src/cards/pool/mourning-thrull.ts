import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 24615. Kjeldoran Gargoyle's trigger.

const TEXT = "Whenever this creature deals damage, you gain that much life.";

export default defineCard({
  name: "Mourning Thrull",
  manaCost: "{1}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `({W/B} can be paid with either {W} or {B}.)\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
