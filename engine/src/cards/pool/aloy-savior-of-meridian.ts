import { defineCard } from "../define.js";

// EDHREC rank 10607. "Among them" is the attackers that counted for the trigger
// (`in: "attackers"`), read as it resolves.

const TEXT =
  "In You, All Things Are Possible — Whenever one or more artifact creatures you control attack, discover X, where X is the greatest power among them. (Exile cards from the top of your library until you exile a nonland card with that mana value or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)";

export default defineCard({
  name: "Aloy, Savior of Meridian",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 5,
  keywords: ["vigilance", "reach"],
  text: `Vigilance, reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you", filter: { types: ["artifact", "creature"] } },
      targets: [],
      effect: { kind: "discover", amount: { aggregate: "max", of: "power", filter: {}, in: "attackers" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
