import { defineCard } from "../define.js";

export default defineCard({
  name: "Skycoach Waypoint",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{3}, {T}: Target creature becomes prepared. (Only creatures with prepare spells can become prepared.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-prepared", target: 0 },
      resolve: null,
      text: "{3}, {T}: Target creature becomes prepared.",
    },
  ],
});
