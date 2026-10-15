import { defineCard } from "../define.js";

// EDHREC rank 23339.
// Its Adventure is Gone Fishing (gone-fishing.ts).

export default defineCard({
  name: "Lake-town Mariners",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 6,
  toughness: 5,
  keywords: ["vigilance"],
  text: "Vigilance\nWard {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
  ],
  faces: ["Lake-town Mariners", "Gone Fishing"],
  adventure: true,
});
