import { defineCard } from "../define.js";

export default defineCard({
  name: "Blinkmoth Well",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{2}, {T}: Tap target noncreature artifact.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{2}, {T}: Tap target noncreature artifact.",
    },
  ],
});
