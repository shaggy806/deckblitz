import { defineCard } from "../define.js";

// EDHREC rank 2878.
//
// Rulings:
//   Web-slinging represents an alternative cost. If another effect allows you to play a card for
//     a different alternative cost, including "without paying its mana cost," you can't also
//     choose to pay its web-slinging cost.

export default defineCard({
  name: "Spider-Sense",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  webSlinging: { cost: "{U}" },
  text:
    "Web-slinging {U} (You may cast this spell for {U} if you also return a tapped creature you control to its owner's hand.)\n" +
    "Counter target instant spell, sorcery spell, or triggered ability.",
  targets: ["instant-or-sorcery-spell-or-triggered-ability"],
  effect: { kind: "counter", target: 0 },
});
