import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Conjure is MTG Arena's (the `conjure`
// effect); "this ability triggers only once" is ever, for this object
// (`triggersOnlyOnce`). "Your second noncreature spell in a turn" counts only
// noncreature spells (`nthEachTurn` with a filter).
const CONJURE_TEXT =
  "When you cast your second noncreature spell in a turn, conjure a card named Mox Sapphire into your hand. This ability triggers only once.";
const FLASHBACK_TEXT =
  "{2}{U}: Target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost.";

export default defineCard({
  name: "Sapphire Collector",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 3,
  toughness: 3,
  text: `Prowess\n${CONJURE_TEXT}\n${FLASHBACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess",
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"] }, nthEachTurn: 2 },
      triggersOnlyOnce: true,
      targets: [],
      effect: { kind: "conjure", name: "Mox Sapphire", to: "hand" },
      resolve: null,
      text: CONJURE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: ["instant-or-sorcery-in-your-graveyard"],
      effect: { kind: "grant-flashback", target: 0 },
      resolve: null,
      text: FLASHBACK_TEXT,
    },
  ],
});
