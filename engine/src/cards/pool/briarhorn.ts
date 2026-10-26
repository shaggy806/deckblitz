import { defineCard } from "../define.js";

export default defineCard({
  name: "Briarhorn",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  evoke: { cost: "{1}{G}" },
  text: "Flash\nWhen this creature enters, target creature gets +3/+3 until end of turn.\nEvoke {1}{G} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, target creature gets +3/+3 until end of turn.",
    },
  ],
});
