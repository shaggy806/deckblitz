import { defineCard } from "../define.js";

// EDHREC rank 25766.

export default defineCard({
  name: "Dawnfluke",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 3,
  keywords: ["flash"],
  evoke: { cost: "{W}" },
  text: "Flash\nWhen this creature enters, prevent the next 3 damage that would be dealt to any target this turn.\nEvoke {W} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 3 },
      resolve: null,
      text: "When this creature enters, prevent the next 3 damage that would be dealt to any target this turn.",
    },
  ],
});
