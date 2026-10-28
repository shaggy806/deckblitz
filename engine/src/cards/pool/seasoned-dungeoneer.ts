import { defineCard } from "../define.js";

// EDHREC rank 4622.

const ATTACK_TEXT =
  "Whenever you attack, target attacking Cleric, Rogue, Warrior, or Wizard gains protection from creatures until end of turn. It explores.";

export default defineCard({
  name: "Seasoned Dungeoneer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 4,
  text: `When this creature enters, you take the initiative.\n${ATTACK_TEXT} (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on the creature, then put the card back or put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this creature enters, you take the initiative.",
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", attacking: true, subtypes: ["Cleric", "Rogue", "Warrior", "Wizard"] },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-protection", target: 0, from: { types: ["creature"] }, duration: "end-of-turn" },
          { kind: "explore", target: 0 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
