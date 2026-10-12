import { defineCard } from "../define.js";

// EDHREC rank 8039.
//
// Rulings:
//   The creature you return must be tapped at the time you pay costs, but doesn't necessarily
//     need to be tapped before you start casting the spell (tap it for mana first, then return it).
//   Use the mana value of the creature as it last existed on the battlefield to determine the value
//     of X. If it had {X} in its mana cost, X is 0 when determining its mana value.

const SAVE_TEXT =
  "Sensational Save — If Scarlet Spider was cast using web-slinging, he enters with X +1/+1 counters on him, where X is the mana value of the returned creature.";

// The returned creature's last-known mana value rides on the spell
// (`GameObject.webSlingingManaValue`); cast any other way, X is nothing.
export default defineCard({
  name: "Scarlet Spider, Ben Reilly",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  webSlinging: { cost: "{R}{G}" },
  text: `Web-slinging {R}{G} (You may cast this spell for {R}{G} if you also return a tapped creature you control to its owner's hand.)\nTrample\n${SAVE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "web-slinging-mana-value" } },
      text: SAVE_TEXT,
    },
  ],
});
