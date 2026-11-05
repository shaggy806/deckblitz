import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

const DAMAGE_TEXT =
  "Whenever this Vehicle deals combat damage to a player, put the top two cards of that player's library onto the battlefield face down under your control. They're 2/2 Cyberman artifact creatures.";

export default defineCard({
  name: "Cybership",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 8,
  toughness: 8,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT}\n${crewText(4)}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        from: "trigger-player",
        count: 2,
        min: 2,
        max: 2,
        destination: "battlefield",
        under: "you",
        enterAs: { faceDown: "2/2 Cyberman artifact creature" },
        leftover: "stay",
        prompt: "Put the top two cards of that player's library onto the battlefield face down",
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [crew(4, crewText(4))],
});
