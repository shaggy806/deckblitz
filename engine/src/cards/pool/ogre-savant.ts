import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 30842.
//
// Deceit's intervening-if with one {U}. The bounce is mandatory and may have
// to take the Ogre itself (the rulings).

const TEXT = "When this creature enters, if {U} was spent to cast it, return target creature to its owner's hand.";

export default defineCard({
  name: "Ogre Savant",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Wizard"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { U: 1 } } },
      targets: ["creature"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
