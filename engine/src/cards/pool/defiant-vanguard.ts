import { defineCard } from "../define.js";

const BLOCK_TEXT = "When this creature blocks, at end of combat, destroy it and all creatures it blocked this turn.";
const SEARCH_TEXT =
  "{5}, {T}: Search your library for a Rebel permanent card with mana value 4 or less, put it onto the battlefield, then shuffle.";

// The delayed ability binds "it" as it's set up (`blockedThisTurn`'s `of:
// "source"`), so the creatures it blocked are found even once it has left;
// it and they are destroyed together.
export default defineCard({
  name: "Defiant Vanguard",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 2,
  toughness: 2,
  text: `${BLOCK_TEXT}\n${SEARCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        text: "Destroy it and all creatures it blocked this turn.",
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "destroy", target: "source" },
            {
              kind: "destroy-all",
              filter: { type: "creature", blockedThisTurn: { relation: "blocked-by", of: "source" } },
            },
          ],
        },
      },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Rebel",
          manaValue: { op: "lte", n: 4 },
        },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
