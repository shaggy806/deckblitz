import { defineCard } from "../define.js";

// EDHREC rank 8476.
//
// Rulings:
//   [2017-08-25] If O-Kagachi deals lethal damage to a blocking creature and also deals damage to
//     its controller, that blocking creature is destroyed before a target is selected for
//     O-Kagachi's last ability. It can't be exiled.
//   [2017-08-25] A player attacked you if that player declared a creature as an attacking creature
//     and that creature is attacking you. If that player attacked only planeswalkers you control,
//     that player didn't attack you. If that player's creatures were attacking you only because
//     they were put onto the battlefield attacking or only because you were reselected as the
//     player they were attacking, that player didn't attack you.
//   [2017-08-25] O-Kagachi's last ability exiles only one nonland permanent, no matter how many
//     creatures attacked you or how many times that player attacked you during their last turn.

export default defineCard({
  name: "O-Kagachi, Vengeful Kami",
  manaCost: "{1}{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Spirit"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: "Flying, trample\nWhenever O-Kagachi deals combat damage to a player, if that player attacked you during their last turn, exile target nonland permanent that player controls.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      // The player, not a planeswalker of theirs (the ruling).
      condition: { kind: "attacked-you-last-turn", by: "that-player" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { notTypes: ["land"] } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "Whenever O-Kagachi deals combat damage to a player, if that player attacked you during their last turn, exile target nonland permanent that player controls.",
    },
  ],
});
