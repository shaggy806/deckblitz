import { defineCard } from "../define.js";

const DRAW_TEXT =
  "Whenever this creature or another creature with the same name deals combat damage to a player, you draw a card.";
const COPY_TEXT =
  "You may have this creature enter as a copy of any creature on the battlefield, except it's a Pirate in " +
  `addition to its other types and it has "${DRAW_TEXT}"`;

// The Pirate type and the triggered ability are copiable values (rule
// 707.9a), so a copy of it has them too. "Another creature with the same
// name" is any player's, and "this creature" has its own name: one trigger
// per creature that dealt combat damage. A creature with no name (face down)
// shares a name with nothing (rule 201.2a). Declining, it's a 0/0 without
// the ability.
export default defineCard({
  name: "Pirated Copy",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Pirate"],
  power: 0,
  toughness: 0,
  text: COPY_TEXT,
  copyOnEnter: {
    filter: { type: "creature" },
    except: {
      addSubtypes: ["Pirate"],
      triggered: [
        {
          trigger: {
            on: "deals-combat-damage-to-player",
            who: "any",
            filter: { type: "creature", sameNameAsSource: true },
          },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: DRAW_TEXT,
        },
      ],
    },
  },
});
