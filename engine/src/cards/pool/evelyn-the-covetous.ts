import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "Whenever Evelyn or another Vampire you control enters, exile the top card of each player's library with a collection counter on it.";
const TEXT =
  "Once each turn, you may play a card from exile with a collection counter on it if it was exiled by an ability you controlled, and you may spend mana as though it were mana of any color to cast it.";

export default defineCard({
  name: "Evelyn, the Covetous",
  manaCost: "{2}{U/B}{B}{B/R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 2,
  toughness: 5,
  keywords: ["flash"],
  text: `Flash\n${ENTERS_TEXT}\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Vampire" } },
      targets: [],
      effect: { kind: "exile-from-library", whose: "each-player", amount: 1, withCounters: { kind: "collection", amount: 1 } },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "exile",
        play: true,
        filter: { counters: { kind: "collection", compare: { op: "gte", n: 1 } } },
        exiledByYou: true,
        oncePerTurn: true,
        spendAs: "any-color",
      },
      text: TEXT,
    },
  ],
});
