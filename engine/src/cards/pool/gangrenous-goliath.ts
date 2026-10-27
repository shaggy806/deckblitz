import { defineCard } from "../define.js";

const TEXT = "Tap three untapped Clerics you control: Return this card from your graveyard to your hand.";

// Only while it's in your graveyard (the ruling).
export default defineCard({
  name: "Gangrenous Goliath",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 4,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 3, filter: { subtype: "Cleric", controlledBy: "you" } } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
