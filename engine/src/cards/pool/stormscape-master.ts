import { defineCard } from "../define.js";

// EDHREC rank 31193.

export default defineCard({
  name: "Stormscape Master",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{W}{W}, {T}: Target creature gains protection from the color of your choice until end of turn.\n{B}{B}, {T}: Target player loses 2 life and you gain 2 life.",
  activated: [
    {
      cost: { mana: "{W}{W}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "grant-protection",
        target: 0,
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W}{W}, {T}: Target creature gains protection from the color of your choice until end of turn.",
    },
    {
      cost: { mana: "{B}{B}", tap: true },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
      },
      resolve: null,
      text: "{B}{B}, {T}: Target player loses 2 life and you gain 2 life.",
    },
  ],
});
