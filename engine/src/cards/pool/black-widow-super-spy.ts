import { defineCard } from "../define.js";

const TEXT =
  "Whenever Black Widow deals combat damage to a player, that player exiles cards from the top of their library until they exile a nonland card. You may put a +1/+1 counter on Black Widow. If you don't, you may cast the exiled nonland card until end of turn and mana of any type can be spent to cast that spell.";

export default defineCard({
  name: "Black Widow, Super Spy",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until",
        whose: "that-player",
        filter: { notTypes: ["land"] },
        exile: true,
        rest: "stay",
        then: {
          kind: "may",
          prompt: "Put a +1/+1 counter on Black Widow? (If you don't, you may cast the exiled card this turn.)",
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          else: { kind: "grant-play", cards: 0, duration: "end-of-turn", spendAs: "any-type" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
