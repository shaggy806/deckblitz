import { defineCard } from "../define.js";

// EDHREC rank 10038.

export default defineCard({
  name: "Tower of the Magistrate",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}, {T}: Target creature gains protection from artifacts until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "grant-protection",
        target: 0,
        from: { types: ["artifact"] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}, {T}: Target creature gains protection from artifacts until end of turn.",
    },
  ],
});
