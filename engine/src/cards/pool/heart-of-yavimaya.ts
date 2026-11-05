import { defineCard } from "../define.js";

// EDHREC rank 24509.

export default defineCard({
  name: "Heart of Yavimaya",
  colors: [],
  types: ["land"],
  text: "If this land would enter, sacrifice a Forest instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.\n{T}: Add {G}.\n{T}: Target creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature gets +1/+1 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        instead: { sacrifice: { filter: { subtype: "Forest" }, count: 1 } },
      },
      text: "If this land would enter, sacrifice a Forest instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.",
    },
  ],
});
