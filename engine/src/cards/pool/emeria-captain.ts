import { defineCard } from "../define.js";

// EDHREC rank 21977.
//
// A trigger, not a replacement: the party is counted as it resolves, the
// Captain itself included if it's still there (the rulings).

const ENTER_TEXT =
  "When this creature enters, put a +1/+1 counter on it for each creature in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)";

export default defineCard({
  name: "Emeria Captain",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { partySize: "you" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
