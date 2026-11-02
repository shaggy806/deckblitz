import { defineCard } from "../define.js";

const ENTER_TEXT = "When this enchantment enters, you may search your library and/or graveyard for a card named Ajani, Valiant Protector, reveal it, and put it into your hand. If you search your library this way, shuffle.";
const SAC_TEXT = "Sacrifice this enchantment: Prevent all combat damage a creature of your choice would deal this turn.";

const search = (zones: "library" | "graveyard" | "library-and-graveyard") =>
  ({
    kind: "search-library",
    filter: { name: "Ajani, Valiant Protector" },
    destination: "hand",
    reveal: true,
    min: 0,
    max: 1,
    zones,
  }) as const;

export default defineCard({
  name: "Ajani's Aid",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search for Ajani, Valiant Protector?",
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            { text: "Search your library and graveyard", effect: search("library-and-graveyard") },
            { text: "Search your library", effect: search("library") },
            { text: "Search your graveyard", effect: search("graveyard") },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature" },
        min: 1,
        upTo: 1,
        prompt: "Choose a creature",
        then: { kind: "damage-rule", by: { target: 0 }, combat: true },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
