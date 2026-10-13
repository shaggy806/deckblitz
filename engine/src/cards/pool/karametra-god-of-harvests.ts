import { defineCard } from "../define.js";

// EDHREC rank 3171.
//
// Rulings:
//   [2013-09-15] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2013-09-15] Numeric mana symbols ({0}, {1}, and so on) in mana costs of permanents you
//     control don't count toward your devotion to any color.
//   [2013-09-15] Mana symbols in the text boxes of permanents you control don't count toward your
//     devotion to any color.
//   [2013-09-15] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it's still on the battlefield at that time.
//   [2014-02-01] If you cast a creature card with bestow for its bestow cost, it becomes an Aura
//     spell and not a creature spell. Karametra's last ability won't trigger.
//   [2014-02-01] You can use the last ability to put any land card with the subtype Forest or
//     Plains onto the battlefield, not just ones named Forest or Plains.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won't rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won't be counted when determining this.
//   [2020-01-24] The abilities of Gods function as long as they're on the battlefield, regardless
//     of whether they're creatures.
//   [2020-01-24] Counters put on a God remain on it while it's not a creature, even if they have
//     no effect.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] Your devotion to two colors is the number of mana symbols among mana costs of
//     permanents you control that are the first color, the second, or both. If an effect counts
//     your devotion to two colors, a hybrid symbol that is both of those colors is counted just
//     once.
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It's always a creature card in other zones, regardless of your devotion to
//     its color. It's always a creature spell while it's on the stack.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-11-10] If Karametra stops being a creature, it loses the type creature and the creature
//     type God. It continues to be a legendary enchantment.
//   [2020-11-10] If an effect causes Karametra to lose all abilities, its ability that causes it
//     to stop being a creature still applies if appropriate.
//   [2020-11-10] If Karametra is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won't rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-11-10] Your devotion to two colors is the number of mana symbols among mana costs of
//     permanents you control that are the first color, the second, or both. If an effect counts
//     your devotion to two colors, a hybrid symbol that is both of those colors is counted just
//     once.
//   [2020-11-10] An ability that triggers when a player casts a spell resolves before the spell
//     that caused it to trigger. It resolves even if that spell is countered.
//   [2020-11-10] The type-changing ability that can make Karametra not be a creature functions
//     only on the battlefield. It's always a creature card in other zones, regardless of your
//     devotion to its color. It's always a creature spell while it's on the stack.
//   [2020-11-10] Counters put on Karametra remain on it while it's not a creature, even if they
//     have no effect.
//   [2020-11-10] Karametra's abilities function as long as it's on the battlefield, regardless of
//     whether it's a creature.
//   [2020-11-10] When Karametra enters the battlefield, your devotion to green and white will
//     determine if a creature entered the battlefield or not for abilities that trigger whenever a
//     creature enters the battlefield. The mana symbols in Karametra's own mana cost are counted
//     when determining this.
//   [2020-11-10] As Karametra enters the battlefield, your devotion to green and white will
//     determine whether any replacement effects that affect creatures entering the battlefield
//     apply. Because replacement effects are considered before Karametra is on the battlefield,
//     the mana symbols in its mana cost won't be counted when determining this.

export default defineCard({
  name: "Karametra, God of Harvests",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 6,
  toughness: 7,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to green and white is less than seven, Karametra isn't a creature.\nWhenever you cast a creature spell, you may search your library for a Forest or Plains card, put it onto the battlefield tapped, then shuffle.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Forest or Plains card?",
        effect: {
          kind: "search-library",
          filter: { subtypes: ["Forest", "Plains"] },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
        },
      },
      resolve: null,
      text: "Whenever you cast a creature spell, you may search your library for a Forest or Plains card, put it onto the battlefield tapped, then shuffle.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["G", "W"], atMost: 6 },
      removeTypes: ["creature"],
      text: "As long as your devotion to green and white is less than seven, Karametra isn't a creature.",
    },
  ],
});
