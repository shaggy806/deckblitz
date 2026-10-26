import { defineCard } from "../define.js";

// EDHREC rank 12356.
//
// Rulings:
//   [2009-05-01] The second ability counts all Zombies you control, not just the tokens put onto
//     the battlefield with the first ability. It will count Lich Lord of Unx itself if it's still
//     under your control and still a Zombie when the ability resolves.
const ZOMBIES = { countOf: { subtype: "Zombie", controlledBy: "you" } } as const;

export default defineCard({
  name: "Lich Lord of Unx",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{U}{B}, {T}: Create a 1/1 blue and black Zombie Wizard creature token.\n{U}{U}{B}{B}: Target player loses X life and mills X cards, where X is the number of Zombies you control.",
  activated: [
    {
      cost: { mana: "{U}{B}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Wizard Token", count: 1 },
      resolve: null,
      text: "{U}{B}, {T}: Create a 1/1 blue and black Zombie Wizard creature token.",
    },
    {
      cost: { mana: "{U}{U}{B}{B}", tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", target: 0, amount: ZOMBIES },
          { kind: "mill", target: 0, amount: ZOMBIES },
        ],
      },
      resolve: null,
      text: "{U}{U}{B}{B}: Target player loses X life and mills X cards, where X is the number of Zombies you control.",
    },
  ],
});
