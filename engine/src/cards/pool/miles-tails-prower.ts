import { defineCard } from "../define.js";

// EDHREC rank 11476. Whether the Vehicle has flying is read as the ability
// resolves.

const ENTER_TEXT =
  "Whenever a Vehicle you control enters, draw a card if it has flying. Otherwise, put a flying counter on it.";

export default defineCard({
  name: "Miles \"Tails\" Prower",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fox", "Artificer"],
  power: 3,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Vehicle" } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { keyword: "flying" } },
        then: { kind: "draw", amount: 1 },
        else: { kind: "add-counter", target: "trigger-object", counter: "flying", amount: 1 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
