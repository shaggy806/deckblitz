import { defineCard } from "../define.js";

// EDHREC rank 21312.
// Makes Bat → use "Bat Token".
// The Bats count the mana the permanent kept from its cast that a Cave made (`manaSpentOf` with `from`).

const ENTER_TEXT =
  "When this enchantment enters, create a 1/1 black Bat creature token with flying for each mana from a Cave spent to cast it.";
const CAVE_TEXT = "Whenever a Cave you control enters, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Bat Colony",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${CAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Bat Token",
        count: { manaSpentOf: "source", from: { subtype: "Cave" } },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Cave" } },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAVE_TEXT,
    },
  ],
});
