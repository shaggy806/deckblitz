import { defineCard } from "../define.js";

export default defineCard({
  name: "Chaos Harlequin",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 4,
  text: "{R}: Exile the top card of your library. If that card is a land card, this creature gets -4/-0 until end of turn. Otherwise, this creature gets +2/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "land" }, atLeast: 1 },
            then: { kind: "modify-pt", target: "source", power: -4, toughness: 0, duration: "end-of-turn" },
            // "Otherwise" is a nonland card exiled; with an empty library
            // nothing was exiled, so there's no "that card" and neither applies.
            else: {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
            },
          },
        ],
      },
      resolve: null,
      text: "{R}: Exile the top card of your library. If that card is a land card, this creature gets -4/-0 until end of turn. Otherwise, this creature gets +2/+0 until end of turn.",
    },
  ],
});
