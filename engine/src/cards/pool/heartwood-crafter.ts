import { defineCard } from "../define.js";

// A deny-list: the mana pays for abilities, a graveyard cast and this card's own
// prepared copy of Soul Tether, cast from exile (rule 722.3c).
const PREPARED_TEXT = "This creature enters prepared.";
const MANA_TEXT = "{T}: Add {C}. This mana can't be spent to cast spells from your hand.";

export default defineCard({
  name: "Heartwood Crafter",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Artificer"],
  power: 1,
  toughness: 1,
  text: `${PREPARED_TEXT} (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\n${MANA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: PREPARED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 1,
        spendOnly: { notCastFrom: ["hand"], text: "This mana can't be spent to cast spells from your hand." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  prepareSpell: "Soul Tether",
});
