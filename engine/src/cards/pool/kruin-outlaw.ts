import { defineCard } from "../define.js";

// EDHREC rank 10317. Front face of Kruin Outlaw // Terror of Kruin Pass — the
// Innistrad werewolf transform (Daybreak Ranger's shape).
//
// Rulings:
//   [2011-09-22] If Kruin Outlaw somehow transforms after blockers have been declared but before
//     combat ends, any Werewolves you control that are blocked by a single creature will remain
//     blocked.

const TRANSFORM = "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.";

export default defineCard({
  name: "Kruin Outlaw",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Werewolf"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${TRANSFORM}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM,
      condition: { kind: "spells-cast-last-turn", none: true },
    },
  ],
  faces: ["Kruin Outlaw", "Terror of Kruin Pass"],
  transform: true,
});
