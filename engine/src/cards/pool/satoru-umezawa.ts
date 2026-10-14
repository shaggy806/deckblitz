import { defineCard } from "../define.js";

// EDHREC rank 3704.
//
// Rulings:
//   [2022-02-18] The ninjutsu ability can be activated only after blockers have been declared.
//     Before then, attacking creatures are neither blocked nor unblocked.
//   [2022-02-18] Although the Ninja is attacking, it was never declared as an attacking creature
//     (for purposes of abilities that trigger whenever a creature attacks, for example).
//   [2022-02-18] If a creature in combat has first strike or double strike, you can activate the
//     ninjutsu ability during the first-strike combat damage step. The Ninja will deal combat
//     damage during the regular combat damage step, even if it has first strike.
//   [2022-02-18] The creature with ninjutsu enters the battlefield attacking the same player or
//     planeswalker that the returned creature was attacking. This is a rule specific to ninjutsu;
//     in other cases, when a creature is put onto the battlefield attacking, that creature's
//     controller chooses which player or planeswalker it's attacking.
//   [2022-02-18] Once you activate a ninjutsu ability, no player can affect that ability by
//     removing Satoru Umezawa from the battlefield. Even if Satoru leaves the battlefield before
//     it resolves, you'll still be able to put the creature onto the battlefield tapped and
//     attacking.
//   [2022-02-18] The ninjutsu ability can be activated during the declare blockers step, combat
//     damage step, or end of combat step. In most cases (see below), if you wait until the
//     combatdamage step or end of combat step, it will be after combat damage has been dealt, so
//     the Ninja won't deal combat damage.
//   [2022-02-18] As you activate a ninjutsu ability, you reveal the Ninja card in your hand and
//     return the attacking creature. The Ninja card stays revealed and isn't put onto the
//     battlefield until the ability resolves. If it leaves your hand before then, it won't enter
//     the battlefield at all.
//   [2022-02-18] Puff of smoke not included.
//   [2022-02-18] Satoru Umezawa's triggered ability triggers whenever you activate a ninjustsu
//     ability, and it will resolve before that ability resolves. The card with ninjustsu will
//     still be in your hand while resolving the ability and must remain revealed until the
//     ninjutsu ability resolves or is otherwise removed from the stack.

export default defineCard({
  name: "Satoru Umezawa",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 2,
  toughness: 4,
  text: "Whenever you activate a ninjutsu ability, look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order. This ability triggers only once each turn.\nEach creature card in your hand has ninjutsu {2}{U}{B}.",
  triggered: [
    {
      trigger: { on: "activates-ability", who: "you", ninjutsu: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: "Whenever you activate a ninjutsu ability, look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsNinjutsuInHand: { cost: "{2}{U}{B}", filter: { type: "creature" } },
      text: "Each creature card in your hand has ninjutsu {2}{U}{B}.",
    },
  ],
});
