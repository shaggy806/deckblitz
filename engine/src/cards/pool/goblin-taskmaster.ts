import { defineCard } from "../define.js";

// EDHREC rank 24346.

export default defineCard({
  name: "Goblin Taskmaster",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{R}" },
  text: "{1}{R}: Target Goblin creature gets +1/+0 until end of turn.\nMorph {R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Goblin" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}: Target Goblin creature gets +1/+0 until end of turn.",
    },
  ],
});
