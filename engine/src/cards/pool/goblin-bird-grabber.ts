import { defineCard } from "../define.js";

// EDHREC rank 26615. Celestial Enforcer's activation gate, checked only as
// it's activated (the ruling); an activated ability's `controls` counts the
// source, so a Goblin that already flies satisfies it.

const TEXT = "{R}: This creature gains flying until end of turn. Activate only if you control a creature with flying.";

export default defineCard({
  name: "Goblin Bird-Grabber",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      condition: { kind: "controls", filter: { type: "creature", keyword: "flying" }, atLeast: 1 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
