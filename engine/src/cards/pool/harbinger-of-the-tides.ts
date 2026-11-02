import { defineCard } from "../define.js";

const ENTERS = "When this creature enters, you may return target tapped creature an opponent controls to its owner's hand.";

export default defineCard({
  name: "Harbinger of the Tides",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{2}", keyword: "flash", flash: true },
  text: `You may cast this spell as though it had flash if you pay {2} more to cast it. (You may cast it any time you could cast an instant.)\n${ENTERS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", tapped: true } }],
      effect: {
        kind: "may",
        prompt: "Return target tapped creature an opponent controls to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
