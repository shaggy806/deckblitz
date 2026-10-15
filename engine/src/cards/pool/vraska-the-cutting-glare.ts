import { defineCard } from "../define.js";

// EDHREC rank 23632.
// Makes Treasure → use "Treasure Token".
//
// Rulings:
//   [2026-08-21] Vraska's last ability checks at the moment it would trigger to see if you control
//     six or more lands. If you don't, the ability won't trigger at all. If it does trigger, the
//     ability will check again as it tries to resolve. If you don't control six or more lands at
//     that time, the ability won't resolve and its effect won't happen.

const ENTER_TEXT =
  "When Vraska enters, if you control six or more lands, destroy target permanent an opponent controls. They create a Treasure token.";

// "They" is the destroyed permanent's controller — Beast Within's
// `target-controller`, its last-known controller once it's gone (rule 111.11).
export default defineCard({
  name: "Vraska, the Cutting Glare",
  manaCost: "{B}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gorgon", "Assassin"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ENTER_TEXT} (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 6 },
      targets: [{ kind: "permanent", whose: "opponent", filter: {} }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "create-token", token: "Treasure Token", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
