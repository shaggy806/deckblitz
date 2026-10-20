import { defineCard } from "../define.js";

const REINFORCE_TEXT = "Reinforce 1—{W} ({W}, Discard this card: Put a +1/+1 counter on target creature.)";

export default defineCard({
  name: "Break Ties",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Choose one —\n• Destroy target artifact.\n• Destroy target enchantment.\n• Exile target card from a graveyard.\n${REINFORCE_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Destroy target enchantment.",
        targets: ["enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Exile target card from a graveyard.",
        targets: [{ kind: "card-in-graveyard", whose: "any" }],
        effect: { kind: "exile", target: 0 },
      },
    ],
  },
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: REINFORCE_TEXT,
      zone: "hand",
    },
  ],
});
