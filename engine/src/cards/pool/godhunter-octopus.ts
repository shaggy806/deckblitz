import { defineCard } from "../define.js";

// Checked only as attackers are declared (the ruling), as the static's test is.

const TEXT = "This creature can't attack unless defending player controls an enchantment or an enchanted permanent.";

export default defineCard({
  name: "Godhunter Octopus",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus"],
  power: 5,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { anyOf: [{ type: "enchantment" }, { enchanted: true }] } } }],
      text: TEXT,
    },
  ],
});
