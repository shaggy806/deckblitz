import { defineCard } from "../define.js";

// "Creatures named Leitmotif Composer can't be blocked this turn" changes no
// characteristic, so it binds a Composer that arrives later this turn too
// (rule 611.2c): `restrict`'s turn-wide `filter` form with "cant-be-blocked".
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, draw a card.";
const COPY_TEXT =
  "Whenever you cast an instant or sorcery spell with mana value 5 or greater, create a token that's a copy of this creature.";
const UNBLOCKABLE_TEXT = "{2}{U}: Creatures named Leitmotif Composer can't be blocked this turn.";

export default defineCard({
  name: "Leitmotif Composer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Bard"],
  power: 2,
  toughness: 2,
  text: `${DAMAGE_TEXT}\n${COPY_TEXT}\n${UNBLOCKABLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "gte", n: 5 } },
      },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1 },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [],
      effect: {
        kind: "restrict",
        filter: { type: "creature", name: "Leitmotif Composer" },
        restrictions: ["cant-be-blocked"],
      },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
  ],
});
