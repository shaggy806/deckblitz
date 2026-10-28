import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// The Mark of the Rani token is created attached to the targeted creature
// (Estrid, the Masked's Mask); its static goads the creature it enchants for
// as long as it does (Acquired Mutation's shape).

const MARK_TEXT =
  "Whenever The Rani enters or attacks, create a red Aura enchantment token named Mark of the Rani attached to another target creature. That token has enchant creature and \"Enchanted creature gets +2/+2 and is goaded.\"";
const INVESTIGATE_TEXT = "Whenever a goaded creature deals combat damage to one of your opponents, investigate.";

const MARK = { kind: "create-token", token: "Mark of the Rani Token", count: 1, attachedTo: 0 } as const;

export default defineCard({
  name: "The Rani",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Scientist"],
  power: 3,
  toughness: 4,
  text: `${MARK_TEXT}\n${INVESTIGATE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: MARK,
      resolve: null,
      text: MARK_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [{ kind: "other", of: "creature" }],
      effect: MARK,
      resolve: null,
      text: MARK_TEXT,
    },
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "any",
        filter: { type: "creature", goaded: true },
        toOpponent: true,
      },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: INVESTIGATE_TEXT,
    },
  ],
});
