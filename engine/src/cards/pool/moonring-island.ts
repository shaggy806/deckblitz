import { defineCard } from "../define.js";

const LOOK = "{U}, {T}: Look at the top card of target player's library. Activate only if you control two or more blue permanents.";

export default defineCard({
  name: "Moonring Island",
  colors: [],
  types: ["land"],
  subtypes: ["Island"],
  text: `({T}: Add {U}.)\nThis land enters tapped.\n${LOOK}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
    {
      cost: { mana: "{U}", tap: true },
      targets: ["player"],
      condition: { kind: "controls", filter: { colors: ["U"] }, atLeast: 2 },
      effect: { kind: "look-at-library-top", target: 0 },
      resolve: null,
      text: LOOK,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
