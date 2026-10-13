import { defineCard } from "../define.js";

// EDHREC rank 3246.
//
// Rulings:
//   [2020-01-24] If an effect exiles a creature with a coin counter on it and immediately returns
//     it to the battlefield, Athreos's last ability triggers but will have no effect. If an effect
//     exiles a creature with a coin counter on it and would return it to the battlefield at a
//     later time, Athreos's last ability will return that card to the battlefield and it won't be
//     returned later.
//   [2020-01-24] Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana
//     costs of permanents you control don't count toward your devotion to any color.
//   [2020-01-24] If a creature with a coin counter on it is put into a graveyard or exile but
//     leaves that zone before Athreos's last ability resolves, that card stays in its new zone,
//     even if that zone is also a graveyard or exile. You don't return it to the battlefield.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-01-24] Counters put on a God remain on it while it's not a creature, even if they have
//     no effect.
//   [2020-01-24] If Athreos somehow gets a coin counter on itself, its last ability will return it
//     when it dies or is exiled.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] If Athreos leaves the battlefield, creatures with coin counters on them keep
//     them. The counters won't have any meaning or effect unless another Athreos is on the
//     battlefield later.
//   [2020-01-24] The abilities of Gods function as long as they're on the battlefield, regardless
//     of whether they're creatures.
//   [2020-01-24] In a two-player game, if both players control an Athreos when a creature with a
//     coin counter on it dies, the nonactive player (the one whose turn it isn't) will return the
//     creature under their control. If that happens in a multiplayer game, the nonactive player
//     closest to the right of the player whose turn it is will return the creature under their
//     control.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won't be counted when determining this.
//   [2020-01-24] If you put an Aura on an opponent's permanent, you still control the Aura, and
//     mana symbols in its mana cost count towards your devotion.
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It's always a creature card in other zones, regardless of your devotion to
//     its color. It's always a creature spell while it's on the stack.
//   [2020-01-24] If a token with a coin counter on it dies or is exiled, Athreos's last ability
//     triggers, but won't return it to the battlefield.
//   [2020-01-24] If Athreos and a creature with a coin counter on it are both put into graveyards
//     and/or exiled at the same time, the other creature will be returned to the battlefield.
//   [2020-01-24] Mana symbols in the text boxes of permanents you control don't count toward your
//     devotion to any color.
//   [2020-01-24] The creature returns to the battlefield without a coin counter on it.
//   [2020-01-24] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it's still on the battlefield at that time.
//   [2020-01-24] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2020-01-24] Your devotion to two colors is the number of mana symbols among mana costs of
//     permanents you control that are the first color, the second, or both. If an effect counts
//     your devotion to two colors, a hybrid symbol that is both of those colors is counted just
//     once.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] If a creature with a coin counter on it stops being a creature, it keeps its coin
//     counter, but Athreos's last ability won't trigger when that permanent dies or is exiled
//     unless it's a creature again by that time.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won't rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] If a creature you don't own has a coin counter on it, that permanent will return
//     to the battlefield under your control when it dies or is exiled while you control Athreos.
//     In a multiplayer game, if a player leaves the game, all cards that player owns leave as
//     well. If you leave the game, any creatures you control from Athreos's ability are exiled.

export default defineCard({
  name: "Athreos, Shroud-Veiled",
  manaCost: "{4}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 4,
  toughness: 7,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to white and black is less than seven, Athreos isn't a creature.\nAt the beginning of your end step, put a coin counter on another target creature.\nWhenever a creature with a coin counter on it dies or is put into exile, return that card to the battlefield under your control.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "coin", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, put a coin counter on another target creature.",
    },
    {
      // Kaya's Ghostform's return. A creature with a coin counter as it last
      // existed — one that had stopped being a creature doesn't trigger it —
      // any player's, Athreos itself included (the rulings). A token, or a
      // card that has left that zone since, stays where it is (rule 400.7);
      // it comes back as a new object, without the counter.
      trigger: {
        on: "leaves-battlefield",
        who: "any",
        to: ["graveyard", "exile"],
        filter: { type: "creature", counters: { kind: "coin", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
      resolve: null,
      text: "Whenever a creature with a coin counter on it dies or is put into exile, return that card to the battlefield under your control.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["W", "B"], atMost: 6 },
      removeTypes: ["creature"],
      text: "As long as your devotion to white and black is less than seven, Athreos isn't a creature.",
    },
  ],
});
