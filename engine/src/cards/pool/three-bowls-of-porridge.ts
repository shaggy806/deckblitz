import { defineCard } from "../define.js";

// EDHREC rank 15356.
//
// "That hasn't been chosen": this one artifact, over its whole time on the
// battlefield — `notChosenBefore`, as Silent Hallcreeper's — chosen as the
// ability is activated (rule 700.2b), so a mode counts as chosen even if the
// ability never resolves.

export default defineCard({
  name: "Three Bowls of Porridge",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Food"],
  text: "{2}, {T}: Choose one that hasn't been chosen —\n• This artifact deals 2 damage to target creature.\n• Tap target creature.\n• Sacrifice this artifact. You gain 3 life.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "This artifact deals 2 damage to target creature.",
            targets: ["creature"],
            effect: { kind: "damage", amount: 2, target: 0 },
          },
          { text: "Tap target creature.", targets: ["creature"], effect: { kind: "tap", target: 0 } },
          {
            text: "Sacrifice this artifact. You gain 3 life.",
            effect: { kind: "sequence", effects: [{ kind: "sacrifice-source" }, { kind: "gain-life", amount: 3 }] },
          },
        ],
      },
      resolve: null,
      text: "{2}, {T}: Choose one that hasn't been chosen —\n• This artifact deals 2 damage to target creature.\n• Tap target creature.\n• Sacrifice this artifact. You gain 3 life.",
    },
  ],
});
