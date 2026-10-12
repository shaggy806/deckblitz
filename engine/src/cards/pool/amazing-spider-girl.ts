import { defineCard } from "../define.js";

// EDHREC rank 23691.

export default defineCard({
  name: "Amazing Spider-Girl",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 5,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  webSlinging: { cost: "{2}{W}" },
  text: "Web-slinging {2}{W} (You may cast this spell for {2}{W} if you also return a tapped creature you control to its owner's hand.)\nFlying, vigilance",
});
