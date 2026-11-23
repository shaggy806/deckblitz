import { defineCard } from "../define.js";

// Playtest card. "Its controller" is the destroyed permanent's last-known controller (rule 111.11).

const LOOSE = "The Goose is Loose — Destroy target artifact or enchantment. Its controller creates a Food token.";
const EGG = "The Goose Laid an Egg — Put a +1/+1 counter on target creature. You create a Food token.";

export default defineCard({
  name: "HONK!",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose one —\n• ${LOOSE}\n• ${EGG}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: LOOSE,
        targets: ["artifact-or-enchantment"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "create-token", token: "Food Token", count: 1, who: "target-controller" },
          ],
        },
      },
      {
        text: EGG,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "create-token", token: "Food Token", count: 1 },
          ],
        },
      },
    ],
  },
});
