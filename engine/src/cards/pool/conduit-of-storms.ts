import { defineCard } from "../define.js";

// EDHREC rank 17725. "Your next main phase this turn" is the delayed
// `your-next-main-phase` (Mana Drain's): it fires as the first main phase of
// yours to begin after the attack — this turn's postcombat main. The mana
// comes whether or not the creature is still around, and a Conduit that
// transforms in response still adds {R} (the rulings: the trigger is this
// face's).
const ATTACK_TEXT = "Whenever this creature attacks, add {R} at the beginning of your next main phase this turn.";
const TRANSFORM_TEXT = "{3}{R}{R}: Transform this creature.";

export default defineCard({
  name: "Conduit of Storms",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf", "Horror"],
  power: 2,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${TRANSFORM_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "your-next-main-phase",
        effect: { kind: "add-mana", mana: "R", amount: 1 },
        text: "Add {R}.",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Conduit of Storms", "Conduit of Emrakul"],
  transform: true,
});
