import { defineCard } from "../define.js";

const TEXT =
  "This creature can't attack unless you return an enchantment you control to its owner's hand. (This cost is paid as attackers are declared.)";

// A cost to attack in permanents (rule 508.1h): the enchantment is chosen once
// the declaration is made, and goes to its owner's hand, whoever that is.
export default defineCard({
  name: "Floodtide Serpent",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      combatTax: { on: ["attack"], permanents: { do: "return", filter: { type: "enchantment" }, noun: "enchantment" } },
      text: TEXT,
    },
  ],
});
