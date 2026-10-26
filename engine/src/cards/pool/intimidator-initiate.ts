import { defineCard } from "../define.js";

// EDHREC rank 25563. Shadowmoor. Iron Star's / Hematite Talisman's shape: the target is chosen as
// the trigger goes on the stack, the {1} paid as it resolves.

const TEXT = "Whenever a player casts a red spell, you may pay {1}. If you do, target creature can't block this turn.";

export default defineCard({
  name: "Intimidator Initiate",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["R"] } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {1} so the target creature can't block this turn?",
        cost: "{1}",
        effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
