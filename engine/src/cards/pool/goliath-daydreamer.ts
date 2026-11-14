import { defineCard } from "../define.js";

// Rulings:
//   [2023-04-14] Goliath Daydreamer's last ability allows you to cast an exiled card with a dream
//     counter on it only while the ability is resolving and still on the stack. You can't wait to
//     cast the spell later in the turn. Timing restrictions based on the card's type are ignored.
//   [2023-04-14] If the spell you cast has {X} in its mana cost, you must choose 0 as the value of
//     X when casting it without paying its mana cost.
//   [2023-04-14] The spell will have all of its normal effects before being exiled. If the
//     spell's normal effects include exiling itself, the effect of Goliath Daydreamer's first
//     ability won't apply to it.
//   [2023-04-14] If a spell is countered or otherwise fails to resolve, Goliath Daydreamer's first
//     ability won't exile it.
//
// The first ability marks the spell (`exile-spell-as-it-resolves`), as Gandalf of
// the Secret Fire's does: only a resolving one is exiled, with its dream counter.
// The second reads any dream-countered card its controller owns in exile,
// however it got the counter.

const EXILE_TEXT =
  "Whenever you cast an instant or sorcery spell from your hand, exile that card with a dream counter on it instead of putting it into your graveyard as it resolves.";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may cast a spell from among cards you own in exile with dream counters on them without paying its mana cost.";

export default defineCard({
  name: "Goliath Daydreamer",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Wizard"],
  power: 4,
  toughness: 4,
  text: `${EXILE_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "exile-spell-as-it-resolves", withCounters: { kind: "dream", amount: 1 } },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "cast-now", from: { exiledOwnedWithCounter: "dream" }, free: true },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
