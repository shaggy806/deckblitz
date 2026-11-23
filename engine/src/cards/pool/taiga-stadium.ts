import { defineCard } from "../define.js";

export default defineCard({
  name: "Taiga Stadium",
  colors: [],
  types: ["land"],
  text: "Taiga Stadium enters tapped unless you control a white, blue, or black permanent.\n{T}: Add {R} or {G}.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: {
          kind: "controls",
          filter: { anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }] },
          atLeast: 1,
        },
      },
      text: "Taiga Stadium enters tapped unless you control a white, blue, or black permanent.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R} or {G}.",
    },
  ],
});
