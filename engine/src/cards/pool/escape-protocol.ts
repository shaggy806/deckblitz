import { defineCard } from "../define.js";

// EDHREC rank 15978.
//
// Rulings:
//   [2020-04-17] When the card returns to the battlefield, it will be a new object with no
//     connection to the card that was exiled. Auras attached to the exiled permanent will be put
//     into their owners’ graveyards. Any Equipment will become unattached and remain on the
//     battlefield. Any counters on the exiled permanent will cease to exist.
//   [2020-04-17] While resolving Escape Protocol’s triggered ability, you can’t pay {1} multiple
//     times to exile multiple permanents you control.
//   [2020-04-17] Escape Protocol’s triggered ability goes on the stack without a target. While
//     that ability is resolving, you may pay {1}. If you do, a second ability triggers and you
//     pick a target artifact or creature you control. This is different from abilities that say
//     “If you do . . .” in that players may cast spells and activate abilities after mana is paid
//     but before the target changes zones.
//   [2020-04-17] Some cards with cycling have an ability that triggers when you cycle them, and
//     some cards have an ability that triggers whenever you cycle any card. These triggered
//     abilities resolve before you draw from the cycling ability.
//   [2020-04-17] You can cycle a card even if it has a triggered ability from cycling that won’t
//     have a legal target. This is because the cycling ability and the triggered ability are
//     separate. This also means that if either ability is countered (with Disallow, for example),
//     the other ability will still resolve.
//   [2020-04-17] Triggered abilities from cycling a card and the cycling ability itself aren’t
//     spells. Effects that interact with spells (such as that of Cancel) won’t affect them.
//   [2020-04-17] If a token is exiled this way, it will cease to exist and won’t return to the
//     battlefield.

export default defineCard({
  name: "Escape Protocol",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Whenever you cycle a card, you may pay {1}. When you do, exile target artifact or creature you control, then return it to the battlefield under its owner's control.",
  triggered: [
    {
      trigger: { on: "cycles", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ pay: "{1}", text: "Pay {1}" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
          effect: { kind: "flicker", target: 0 },
          text: "When you do, exile target artifact or creature you control, then return it to the battlefield under its owner's control.",
        },
      },
      resolve: null,
      text: "Whenever you cycle a card, you may pay {1}. When you do, exile target artifact or creature you control, then return it to the battlefield under its owner's control.",
    },
  ],
});
