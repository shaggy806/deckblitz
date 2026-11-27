import { defineCard } from "../define.js";

const TRIGGER_TEXT = "Whenever a spell you control deals damage, put a flame counter on this creature.";
const ABILITY_TEXT =
  "{1}, Remove a flame counter from this creature: Exile the top card of your library. You may play that card this turn.";

export default defineCard({
  name: "Embodiment of Flame",
  art: "https://cards.scryfall.io/art_crop/back/b/e/be91fcba-4599-4ecb-824d-55112096c34a.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Wizard"],
  power: 3,
  toughness: 3,
  text: `${TRIGGER_TEXT}\n${ABILITY_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { isSpell: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "flame", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "flame", count: 1 } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
  faces: ["Flame Channeler", "Embodiment of Flame"],
  transform: true,
});
