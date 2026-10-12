import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 8468.
//
// Rulings:
//   [2025-10-02] Mana from firebending abilities isn't lost until you leave combat and go to your
//     second main phase. It can be used at any time during combat, even after combat damage has
//     been dealt.
//   [2025-10-02] Multiple instances of firebending on the same creature trigger separately, each
//     granting you the appropriate amount of mana.
//   [2025-10-02] Except for the legendary supertype, the token copies only what is printed on Ran
//     and Shaw unless Ran and Shaw are being modified by another copy effect. It doesn't copy
//     whether Ran and Shaw are tapped or untapped, whether they have any counters on them or Auras
//     or Equipment attached to them, or any non-copy effects that have changed their power,
//     toughness, types, color, or so on.
//   [2025-10-02] "Firebending N" is a keyword that represents the ability "Whenever this creature
//     attacks, add N {R}. Until end of combat, you don't lose this mana as steps end."
//   [2025-10-02] Any other mana you add during combat will still be lost as normal when moving
//     between steps of combat.
//   [2025-10-02] Firebending abilities aren't mana abilities. They use the stack and can be
//     responded to.

export default defineCard({
  name: "Ran and Shaw",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  text: "Flying, firebending 2\nWhen Ran and Shaw enter, if you cast them and there are three or more Dragon and/or Lesson cards in your graveyard, create a token that's a copy of Ran and Shaw, except it's not legendary.\n{3}{R}: Dragons you control get +2/+0 until end of turn.",
  keywords: ["flying"],
  triggered: [
    firebending(2, "Firebending 2 (Whenever this creature attacks, add {R}{R}. This mana lasts until end of combat.)"),
    {
      // An intervening if (rule 603.4): both halves are checked as it
      // triggers and again as it resolves.
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "source", filter: { cast: true, castBy: "you" } },
          { kind: "cards-in-graveyard", atLeast: 3, filter: { subtypes: ["Dragon", "Lesson"] } },
        ],
      },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, who: "you", notLegendary: true },
      resolve: null,
      text: "When Ran and Shaw enter, if you cast them and there are three or more Dragon and/or Lesson cards in your graveyard, create a token that's a copy of Ran and Shaw, except it's not legendary.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { subtype: "Dragon", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{3}{R}: Dragons you control get +2/+0 until end of turn.",
    },
  ],
});
