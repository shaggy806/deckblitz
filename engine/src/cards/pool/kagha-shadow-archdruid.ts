import { defineCard } from "../define.js";

// One permission, `play` and `oncePerTurn`: a land played or a permanent spell
// cast through it uses the one allowance (its rulings — another permission's
// plays don't count against it).
export default defineCard({
  name: "Kagha, Shadow Archdruid",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 4,
  text:
    "Whenever Kagha attacks, it gains deathtouch until end of turn. Mill two cards. (Put the top two cards of your library into your graveyard.)\n" +
    "Once during each of your turns, you may play a land or cast a permanent spell from among cards in your graveyard that were put there from your library this turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
          { kind: "mill", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: "Whenever Kagha attacks, it gains deathtouch until end of turn. Mill two cards.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        play: true,
        filter: {
          typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
          putIntoGraveyardFromLibraryThisTurn: true,
        },
        oncePerTurn: true,
        yourTurnOnly: true,
      },
      text: "Once during each of your turns, you may play a land or cast a permanent spell from among cards in your graveyard that were put there from your library this turn.",
    },
  ],
});
