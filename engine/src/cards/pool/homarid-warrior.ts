import { defineCard } from "../define.js";

// It may be activated while already tapped (the ruling); "your next untap
// step" is the activator's (`untapStepOf: "you"`).

const TEXT =
  "{U}: This creature gains shroud until end of turn and doesn't untap during your next untap step. Tap it.";

export default defineCard({
  name: "Homarid Warrior",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homarid", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (A creature with shroud can't be the target of spells or abilities.)`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "shroud", duration: "end-of-turn" },
          { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true, untapStepOf: "you" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
