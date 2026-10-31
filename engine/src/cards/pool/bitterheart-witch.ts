import { defineCard } from "../define.js";

// The found Curse enters attached to the target player (`attachedTo` naming a
// player slot — rule 303.4): one that can't enchant that player stays in the
// library (303.4i).

const TEXT =
  "When this creature dies, you may search your library for a Curse card, put it onto the battlefield attached to target player, then shuffle.";

export default defineCard({
  name: "Bitterheart Witch",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Search your library for a Curse card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Curse" },
          destination: "battlefield",
          min: 0,
          max: 1,
          attachedTo: 0,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
