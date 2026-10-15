import type { ActivatedAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

const GRANTED_TEXT = "{T}: Iron Fist deals damage equal to his power to any other target";
const CAST_TEXT = `Whenever you cast a spell that targets a creature you control, Iron Fist gains "${GRANTED_TEXT}" until end of turn.`;

// The granted ability's "other" and "his power" are the permanent that has
// it — Iron Fist (Black Panther, Most Dangerous's "any other target").
const PUNCH: ActivatedAbility = {
  cost: { mana: null, tap: true },
  targets: [{ kind: "other", of: "any-target" }],
  effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
  resolve: null,
  text: GRANTED_TEXT,
};

export default defineCard({
  name: "Iron Fist, Living Weapon",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 2,
  toughness: 3,
  text: CAST_TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { targets: { permanent: { type: "creature", controlledBy: "you" } } },
      },
      targets: [],
      effect: { kind: "grant-activated", target: "source", ability: PUNCH, duration: "end-of-turn" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
