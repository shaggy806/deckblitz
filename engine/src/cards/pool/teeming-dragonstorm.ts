import { defineCard } from "../define.js";

// EDHREC rank 16982.

const ETB_TEXT = "When this enchantment enters, create two 2/2 white Soldier creature tokens.";
const BOUNCE_TEXT = "When a Dragon you control enters, return this enchantment to its owner's hand.";

export default defineCard({
  name: "Teeming Dragonstorm",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ETB_TEXT}\n${BOUNCE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token (White 2/2)", count: 2 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Dragon" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
