import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 15267. Repartee is Informed Inkwright's cast trigger.

const REPARTEE_TEXT =
  "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, return target creature card from your graveyard to the battlefield.";

export default defineCard({
  name: "Forum Necroscribe",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Troll", "Warlock"],
  power: 5,
  toughness: 4,
  text: `Ward—Discard a card.\n${REPARTEE_TEXT}`,
  triggered: [
    ward({ discard: 1 }),
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { permanent: { type: "creature" } } },
      },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: REPARTEE_TEXT,
    },
  ],
});
