import { defineCard } from "../define.js";

// "Each lose exactly 1 life" is asked of each opponent's whole loss in one
// event (`loses-life`'s `batched` with `exactly`): three 1/1s' combat damage
// is 3 life, no trigger; a drain of 1 from every opponent, one trigger.
// EDHREC rank 4518.
//
// Rulings:
//   [2023-05-12] Ob Nixilis's last ability looks at all combat damage dealt to an opponent in
//     total to determine whether it triggers. For example, if three 1/1 creatures deal combat
//     damage to an opponent, that player loses 3 life. Ob Nixilis's ability won't trigger.
//   [2023-05-12] Playing the card exiled with Ob Nixilis follows the normal rules for playing that
//     card. You must pay its costs, and you must follow all applicable timing rules. For example,
//     if the card is a creature card, you can cast that card by paying its mana cost only during
//     your main phase while the stack is empty.
//   [2023-05-12] If you don't play the card, it will remain exiled.
//   [2023-05-12] Unless an effect allows you to play additional lands that turn, you can play a
//     land card exiled with Ob Nixilis only if you haven't played a land yet that turn.
//   [2023-05-12] You may play the card exiled with Ob Nixilis even if Ob Nixilis leaves the
//     battlefield or you lose control of it.
//   [2023-05-12] Ob Nixilis's last ability will trigger if an opponent is dealt exactly 1 damage,
//     pays exactly 1 life, or loses exactly 1 life some other way.

export default defineCard({
  name: "Ob Nixilis, Captive Kingpin",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 3,
  keywords: ["flying", "trample"],
  text: "Flying, trample\nWhenever one or more opponents each lose exactly 1 life, put a +1/+1 counter on Ob Nixilis. Exile the top card of your library. Until your next end step, you may play that card.",
  triggered: [
    {
      trigger: { on: "loses-life", who: "opponent", batched: true, exactly: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "impulse-exile", amount: 1, duration: "until-your-next-end-step", play: true },
        ],
      },
      resolve: null,
      text: "Whenever one or more opponents each lose exactly 1 life, put a +1/+1 counter on Ob Nixilis. Exile the top card of your library. Until your next end step, you may play that card.",
    },
  ],
});
