import { defineCard } from "../define.js";

// EDHREC rank 26271. "A library" is any player's, yours included, and the
// bonus applies once however many qualify (the ruling).

const TEXT = "This creature gets +4/+8 as long as a library has twenty or fewer cards in it.";

export default defineCard({
  name: "Isleback Spawn",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 4,
  toughness: 8,
  keywords: ["shroud"],
  text: "Shroud (This creature can't be the target of spells or abilities.)\n" + TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "library-size", who: "any-player", atMost: 20 },
      grantPt: [4, 8],
      text: TEXT,
    },
  ],
});
