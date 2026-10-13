import { defineCard } from "../define.js";

// EDHREC rank 3013.
//
// Rulings:
//   [2014-04-26] You are a creature's owner if the card representing it began the game in your
//     deck, or if it's a token that entered the battlefield under your control.
//   [2014-04-26] It doesn't matter who controlled the creature when it died. Athreos's last
//     ability will trigger if you owned that creature.
//   [2014-04-26] If there are no legal targets for Athreos's last ability (perhaps because each of
//     your opponents has hexproof), it will be removed from the stack with no effect. No one may
//     pay 3 life and you won't return the creature card to your hand.
//   [2014-04-26] Athreos's last ability will trigger if a token creature you own dies. The target
//     opponent has the option to pay 3 life, although the token can't return to your hand.
//   [2014-04-26] The target opponent chooses whether to pay 3 life when Athreos's last ability
//     resolves. You won't return the card to your hand if that player pays 3 life or if the card
//     leaves the graveyard before the ability resolves.
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It's always a creature card in other zones, regardless of your devotion to
//     its color. It's always a creature spell while it's on the stack.
//   [2020-01-24] The abilities of Gods function as long as they're on the battlefield, regardless
//     of whether they're creatures.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won't be counted when determining this.
//   [2020-01-24] Your devotion to two colors is the number of mana symbols among mana costs of
//     permanents you control that are the first color, the second, or both. If an effect counts
//     your devotion to two colors, a hybrid symbol that is both of those colors is counted just
//     once.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won't rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-01-24] Counters put on a God remain on it while it's not a creature, even if they have
//     no effect.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.

export default defineCard({
  name: "Athreos, God of Passage",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 4,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to white and black is less than seven, Athreos isn't a creature.\nWhenever another creature you own dies, return it to your hand unless target opponent pays 3 life.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["W", "B"], atMost: 6 },
      removeTypes: ["creature"],
      text: "As long as your devotion to white and black is less than seven, Athreos isn't a creature.",
    },
  ],
  triggered: [
    {
      // Nether Traitor's "a creature you own", whoever controlled it; a token
      // triggers it and can be paid for, to no effect (the rulings). The
      // targeted opponent chooses as it resolves; the card comes back only
      // if it's still the card that died (rule 400.7).
      trigger: { on: "dies", who: "any", otherOnly: true, filter: { type: "creature", ownedBy: "you" } },
      targets: ["opponent"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ payLife: 3, text: "Pay 3 life" }],
        otherwise: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
      },
      resolve: null,
      text: "Whenever another creature you own dies, return it to your hand unless target opponent pays 3 life.",
    },
  ],
});
