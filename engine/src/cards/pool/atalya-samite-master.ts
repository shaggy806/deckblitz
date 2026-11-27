import { defineCard } from "../define.js";

// The mode is chosen as it's activated (rule 700.2). "Spend only white mana on
// X" holds whichever mode (the ruling): the cost's `xSpendOnly`, X paid as
// that many white mana; a cost added to it isn't restricted (the ruling —
// only what is left of the X turns white).

const PREVENT = "Prevent the next X damage that would be dealt to target creature this turn. Spend only white mana on X.";
const GAIN = "You gain X life. Spend only white mana on X.";

export default defineCard({
  name: "Atalya, Samite Master",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: `{X}, {T}: Choose one —\n• ${PREVENT}\n• ${GAIN}`,
  activated: [
    {
      cost: { mana: "{X}", tap: true, xSpendOnly: "W" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: PREVENT, targets: ["creature"], effect: { kind: "prevent-damage", target: 0, amount: "x" } },
          { text: GAIN, effect: { kind: "gain-life", amount: "x" } },
        ],
      },
      resolve: null,
      text: "{X}, {T}: Choose one —",
    },
  ],
});
