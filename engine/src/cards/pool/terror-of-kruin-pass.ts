import { defineCard } from "../define.js";

// Back face of Kruin Outlaw // Terror of Kruin Pass (Nightfall Predator's
// transform back). "Werewolves you control" includes itself.

const MENACE = "Werewolves you control have menace. (A creature with menace can't be blocked except by two or more creatures.)";
const TRANSFORM = "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.";

export default defineCard({
  name: "Terror of Kruin Pass",
  art: "https://cards.scryfall.io/art_crop/back/3/c/3c6ee666-9b5b-428a-9ddb-37c36a6272cb.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 3,
  keywords: ["double-strike"],
  text: `Double strike\n${MENACE}\n${TRANSFORM}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Werewolf" },
      grantKeywords: ["menace"],
      text: MENACE,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM,
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  faces: ["Kruin Outlaw", "Terror of Kruin Pass"],
  transform: true,
});
