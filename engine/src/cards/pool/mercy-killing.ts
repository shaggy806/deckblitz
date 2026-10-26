import { defineCard } from "../define.js";

// Rulings: [2013-07-01] its controller (who may or may not be you) sacrifices it as this
// resolves; neither regeneration nor indestructible saves it. X is the power it last had on the
// battlefield (rule 608.2h), and the tokens are created by that controller.

export default defineCard({
  name: "Mercy Killing",
  manaCost: "{2}{G/W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Target creature's controller sacrifices it, then creates X 1/1 green and white Elf Warrior creature tokens, where X is that creature's power.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice-target", target: 0, byItsController: true },
      {
        kind: "create-token",
        token: "Elf Warrior Token (Rhys the Redeemed)",
        count: { powerOf: 0 },
        who: "target-controller",
      },
    ],
  },
});
