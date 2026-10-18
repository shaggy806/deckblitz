import { defineCard } from "../define.js";

const COMBAT_TEXT =
  "At the beginning of combat on your turn, another target creature gets +2/+2 and loses all abilities until end of turn.";

export default defineCard({
  name: "Primordial Plasm",
  art: "https://cards.scryfall.io/art_crop/back/9/3/93345804-dda4-42a2-84d4-8fcd376dd2d4.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 4,
  toughness: 4,
  text: COMBAT_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "lose-abilities", target: 0, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  faces: ["Invasion of Muraganda", "Primordial Plasm"],
  transform: true,
});
