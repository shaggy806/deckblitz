import { defineCard } from "../define.js";

// The defending player chooses as the ability resolves; if they do, the
// draw is this creature's controller's, and so are the untap and the
// removal from combat.

const TEXT =
  "Whenever this creature attacks, defending player may have you draw a card. If they do, untap this creature and remove it from combat.";

export default defineCard({
  name: "Shakedown Heavy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 6,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-player",
        prompt: "Have the attacker's controller draw a card (and the Ogre leave combat)?",
        effect: { kind: "sequence", effects: [] },
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "untap", target: "source" },
            { kind: "remove-from-combat", target: "source" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
