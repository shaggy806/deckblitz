import { defineCard } from "../define.js";

// Rulings:
//   Although the creature you put onto the battlefield is attacking, it was never declared as an
//     attacking creature.
//   You choose the player, planeswalker, or battle the creature you put onto the battlefield is
//     attacking.

const TEXT =
  "Whenever Arthur and at least one other creature attack, look at the top six cards of your library. You may put a creature card from among them onto the battlefield tapped and attacking. Put the rest on the bottom of your library in a random order. Return that creature to its owner's hand at end of combat.";

export default defineCard({
  name: "Arthur, Marigold Knight",
  manaCost: "{2}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mouse", "Knight"],
  power: 4,
  toughness: 5,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      // One declaration of two or more attackers, Arthur among them (fixed as declared).
      trigger: { on: "attack-with", who: "you", atLeast: 2, includingThis: true, filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 6,
            min: 0,
            max: 1,
            filter: { type: "creature" },
            destination: "battlefield",
            enterTapped: true,
            attacking: "choose",
            leftover: "bottom-random",
          },
          {
            kind: "delayed-trigger",
            at: { step: "end-combat" },
            about: "put-onto-battlefield",
            effect: { kind: "return-to-hand", target: 0 },
            text: "Return that creature to its owner's hand.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
