import { defineCard } from "../define.js";

// Rulings:
//   [2006-05-01] If Rakdos Pit Dragon loses double strike after first strike combat damage has been
//     dealt, it won't deal damage during the normal combat damage step.

const HELLBENT = "Hellbent — This creature has double strike as long as you have no cards in hand.";

export default defineCard({
  name: "Rakdos Pit Dragon",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 3,
  text: `{R}{R}: This creature gains flying until end of turn.\n{R}: This creature gets +1/+0 until end of turn.\n${HELLBENT}`,
  activated: [
    {
      cost: { mana: "{R}{R}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{R}{R}: This creature gains flying until end of turn.",
    },
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      grantKeywords: ["double-strike"],
      text: HELLBENT,
    },
  ],
});
