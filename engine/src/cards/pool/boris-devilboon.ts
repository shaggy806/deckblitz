import { defineCard } from "../define.js";

// EDHREC rank 29586.

const TEXT = "{2}{B}{R}, {T}: Create a 1/1 black and red Demon creature token named Minor Demon.";

export default defineCard({
  name: "Boris Devilboon",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}{R}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Minor Demon Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
