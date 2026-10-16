import { defineCard } from "../define.js";

// EDHREC rank 1694.
//
// Rulings:
//   [2020-11-10] You can choose two commanders with partner that are the same color or colors. In
//     Commander Draft, you can even choose two of the same commander with partner if you drafted
//     them. If you do this, make sure you keep the number of times you've cast each from the
//     command zone clear for "commander tax" purposes.
//   [2020-11-10] Both commanders start in the command zone, and the remaining 98 cards (or 58
//     cards in a Commander Draft game) of your deck are shuffled to become your library.
//   [2020-11-10] You choose which Auras and Equipment to move as Ardenn's ability resolves.
//     Players can't take actions between the time you choose what to move and the time they're
//     attached to the target permanent or player.
//   [2020-11-10] If your Commander deck has two commanders, you can only include cards whose own
//     color identities are also found in your commanders' combined color identities. If Falthis
//     and Kediss are your commanders, your deck may contain cards with black and/or red in their
//     color identity, but not cards with green, white, or blue.
//   [2020-11-10] If something refers to your commander while you have two commanders, it refers to
//     one of them of your choice. If you are instructed to perform an action on your commander
//     (e.g. put it from the command zone into your hand due to Command Beacon), you choose one of
//     your commanders at the time the effect happens.
//   [2020-11-10] An effect that checks whether you control your commander is satisfied if you
//     control one or both of your two commanders.
//   [2020-11-10] Other players and permanents controlled by other players can be targeted by
//     Ardenn's ability. This can cause Equipment under your control to be attached to a creature
//     an opponent controls. Auras and Equipment that say "you" still refer to you, as you still
//     control them. Ardenn's ability can't cause an Aura or Equipment to be attached to something
//     it couldn't be attached to.
//   [2020-11-10] Once the game begins, your two commanders are tracked separately. If you cast
//     one, you won't have to pay an additional {2} the first time you cast the other. A player
//     loses the game after having been dealt 21 damage from any one of them, not from both of them
//     combined.
//   [2020-11-10] To have two commanders, both must have the partner ability as the game begins.
//     Losing the ability during the game doesn't cause either to cease to be your commander.

export default defineCard({
  name: "Ardenn, Intrepid Archaeologist",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kor", "Scout"],
  power: 2,
  toughness: 2,
  pairing: { kind: "partner" },
  text: "At the beginning of combat on your turn, you may attach any number of Auras and Equipment you control to target permanent or player.\nPartner (You can have two commanders if both have partner.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["permanent-or-player"],
      // "Any number" includes none, so the "may" is the choice itself. Each
      // one that can't legally go there stays where it is (rule 701.3b): an
      // Equipment only onto a creature, an Aura only onto what it can
      // enchant — a player only by a Curse.
      effect: {
        kind: "attach",
        target: 0,
        choose: {
          filter: { subtypes: ["Aura", "Equipment"], controlledBy: "you" },
          prompt: "Attach any number of Auras and Equipment you control",
        },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, you may attach any number of Auras and Equipment you control to target permanent or player.",
    },
  ],
});
