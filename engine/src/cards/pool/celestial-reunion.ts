import { defineCard } from "../define.js";

// EDHREC rank 8811.
//
// "You may choose a creature type and behold two creatures of that type" is
// an optional additional cost (rule 601.2b), a kicker by another name,
// offered only with two creatures (or creature cards in hand) that share a
// type. As it's paid (601.2h) the caster beholds two that share one, then
// names the type they share when there's more than one choice: the spell's
// chosen creature type (`BeholdSpec.shareCreatureType`). Kicked, a found card
// of that type goes onto the battlefield instead of into the hand.

const search = {
  kind: "search-library",
  filter: { type: "creature", manaValue: { op: "lte", n: "x" } },
  destination: "hand",
  min: 0,
  max: 1,
  reveal: true,
} as const;

export default defineCard({
  name: "Celestial Reunion",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, you may choose a creature type and behold two creatures of that type.\nSearch your library for a creature card with mana value X or less, reveal it, put it into your hand, then shuffle. If this spell's additional cost was paid and the revealed card is the chosen type, put that card onto the battlefield instead of putting it into your hand.",
  kicker: {
    cost: "",
    keyword: "behold",
    behold: { filter: { type: "creature" }, count: 2, shareCreatureType: true, text: "two creatures of a chosen type" },
    effect: { ...search, instead: { destination: "battlefield", filter: { ofChosenType: true }, pick: "all" } },
  },
  targets: [],
  effect: search,
});
