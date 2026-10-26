import { defineCard } from "../define.js";

export default defineCard({
  name: "Mad Auntie",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  text: "Other Goblin creatures you control get +1/+1.\n{T}: Regenerate another target Goblin.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { subtype: "Goblin" } } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{T}: Regenerate another target Goblin.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Goblin" },
      grantPt: [1, 1],
      text: "Other Goblin creatures you control get +1/+1.",
    },
  ],
});
