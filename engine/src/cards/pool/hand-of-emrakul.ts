import { defineCard } from "../define.js";
import { annihilator } from "../helpers.js";

// Rise of the Eldrazi (ROE). EDHREC rank 12859.
//
// "You may sacrifice four Eldrazi Spawn rather than pay this spell's mana
// cost": an alternative cost (rule 118.9) of four permanents that are both
// Eldrazi and Spawn, chosen as the cost is paid (601.2h). It doesn't change
// when it can be cast, nor its mana value (rulings).

export default defineCard({
  name: "Hand of Emrakul",
  manaCost: "{9}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 7,
  toughness: 7,
  text: "You may sacrifice four Eldrazi Spawn rather than pay this spell's mana cost.\nAnnihilator 1 (Whenever this creature attacks, defending player sacrifices a permanent of their choice.)",
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { subtype: "Eldrazi", subtypes: ["Spawn"] }, count: 4, text: "four Eldrazi Spawn" },
  },
  triggered: [annihilator(1)],
});
