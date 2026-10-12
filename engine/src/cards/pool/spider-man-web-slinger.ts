import { defineCard } from "../define.js";

// EDHREC rank 10761.

export default defineCard({
  name: "Spider-Man, Web-Slinger",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 3,
  toughness: 3,
  webSlinging: { cost: "{W}" },
  text: "Web-slinging {W} (You may cast this spell for {W} if you also return a tapped creature you control to its owner's hand.)",
});
