import { defineCard } from "../define.js";

// EDHREC rank 7036.
// Makes Skeleton → new token "Skeleton Token (Gut, True Soul Zealot)".
//
// Rulings:
//   [2022-06-10] An effect that checks whether you control your commander is satisfied if you
//     control one or both of your two commanders.
//   [2022-06-10] If your Commander deck has two commanders, you can include only cards whose own
//     color identities are also found in your commanders’ combined color identities.
//   [2022-06-10] Effects that modify a creature's power and/or toughness, such as the one created
//     by Titanic Growth, will apply to the creature no matter when they started to take effect.
//     The same is true for any counters that change its power and/or toughness and effects that
//     switch power and toughness.
//   [2022-06-10] You choose the player or planeswalker the Skeleton is attacking.
//   [2022-06-10] Although the Skeleton is an attacking creature, it was never declared as an
//     attacking creature. This means that abilities that trigger whenever a creature attacks won't
//     trigger when it enters the battlefield attacking.
//   [2022-06-10] If a card refers to a commander creature you own, a Background won't usually be
//     counted or included for that effect. If another spell or ability causes your Background to
//     become a creature, however, it will be included. Any effect that refers to your commander or
//     a commander you own or control without specifying creature will apply to a Background that
//     is your commander, as appropriate.
//   [2022-06-10] Halsin, Emerald Archdruid's activated ability overwrites any previous effects
//     that set the creature's base power and toughness to specific values. Any power- or
//     toughness-setting effects that start to apply after Halsin's ability resolves will overwrite
//     this effect.
//   [2022-06-10] If something refers to your commander while you have two commanders, it refers to
//     one of them of your choice. If you are instructed to perform an action on your commander
//     (e.g. put it from the command zone into your hand due to Command Beacon), you choose one of
//     your commanders at the time the effect happens.
//   [2022-06-10] If you control a Background that grants an ability to commander creatures you
//     own, and you own more than one commander creature, each of them will have that ability.
//   [2022-06-10] If your commander loses the choose a Background ability or stops being a
//     Background during the game, as appropriate, it is still your commander.
//   [2022-06-10] If Gut somehow becomes an artifact, you may sacrifice it to its own ability.
//   [2022-06-10] You can choose two commanders that are the same color or colors.
//   [2022-06-10] Once the game begins, your two commanders are tracked separately. If you cast
//     one, you won’t have to pay an additional {2} the first time you cast the other. A player
//     loses the game after having been dealt 21 combat damage from any one of them, not from both
//     of them combined (although your Background won’t usually be a creature anyway).
//   [2022-06-10] Both commanders start in the command zone, and the remaining 98 cards (or 58
//     cards in a Commander Draft game) of your deck are shuffled to become your library.
//   [2022-06-10] Choose a Background is a variant of the partner ability. You may have two
//     commanders if one of them is a legendary creature with the choose a background ability and
//     the other is a legendary Background enchantment. Backgrounds and cards with choose a
//     Background do not interact with cards which have any other partner ability.
//   [2022-06-10] Gut doesn't have to be among the attacking creatures.
//   [2022-06-10] Any effects that say the Skeleton can't attack (such as that of Propaganda)
//     affect only the declaration of attackers. They won't stop the Skeleton from entering the
//     battlefield attacking.

const ATTACK =
  "Whenever you attack, you may sacrifice another creature or an artifact. If you do, create a 4/1 black Skeleton creature token with menace that's tapped and attacking.";

export default defineCard({
  name: "Gut, True Soul Zealot",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  pairing: { kind: "choose-a-background" },
  text: `${ATTACK} (It can't be blocked except by two or more creatures.)\nChoose a Background (You can have a Background as a second commander.)`,
  triggered: [
    {
      // Gut needn't attack (the last-but-one ruling). "Another" is on the
      // creature only: Gut that has become an artifact may sacrifice itself
      // (its ruling) — two options, the creature one never Gut. The Skeleton
      // attacks whom its controller chooses and was never declared (the
      // rulings).
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          { sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" },
          { sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" },
        ],
        ifDid: {
          kind: "create-token",
          token: "Skeleton Token (Gut, True Soul Zealot)",
          count: 1,
          tapped: true,
          attacking: "choose",
        },
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
