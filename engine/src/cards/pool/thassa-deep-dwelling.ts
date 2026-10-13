import { defineCard } from "../define.js";

// EDHREC rank 1310.
//
// Rulings:
//   [2020-01-24] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it’s still on the battlefield at that time.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] Counters put on a God remain on it while it’s not a creature, even if they have
//     no effect.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] If you gain control of a creature “until end of turn,” you’ll control it during
//     your end step.
//   [2020-01-24] The abilities of Gods function as long as they’re on the battlefield, regardless
//     of whether they’re creatures.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won’t be counted when determining this.
//   [2020-01-24] When the card returns to the battlefield, it will be a new object with no
//     connection to the card that was exiled. Auras attached to the exiled creature will be put
//     into their owners’ graveyards. Any Equipment will become unattached and remain on the
//     battlefield. Any counters on the exiled creature will cease to exist.
//   [2020-01-24] Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana
//     costs of permanents you control don’t count toward your devotion to any color.
//   [2020-01-24] If you put an Aura on an opponent’s permanent, you still control the Aura, and
//     mana symbols in its mana cost count towards your devotion.
//   [2020-01-24] Mana symbols in the text boxes of permanents you control don’t count toward your
//     devotion to any color.
//   [2020-01-24] When an effect returns the exiled card “under your control,” you control it
//     indefinitely after that. In a multiplayer game, if a player leaves the game, all cards that
//     player owns leave as well. If you leave the game, any creatures you control from Thassa’s
//     effect but don’t own are exiled.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won’t rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] If a token is exiled this way, it will cease to exist and won’t return to the
//     battlefield.
//   [2020-01-24] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It’s always a creature card in other zones, regardless of your devotion to
//     its color. It’s always a creature spell while it’s on the stack.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.

export default defineCard({
  name: "Thassa, Deep-Dwelling",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 6,
  toughness: 5,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to blue is less than five, Thassa isn't a creature.\nAt the beginning of your end step, exile up to one other target creature you control, then return that card to the battlefield under your control.\n{3}{U}: Tap another target creature.",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{3}{U}: Tap another target creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      // Conjurer's Closet's blink, "up to one other": it comes back a new
      // object, under your control for good (the rulings).
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: { kind: "flicker", target: 0, underYourControl: true },
      resolve: null,
      text: "At the beginning of your end step, exile up to one other target creature you control, then return that card to the battlefield under your control.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["U"], atMost: 4 },
      removeTypes: ["creature"],
      text: "As long as your devotion to blue is less than five, Thassa isn't a creature.",
    },
  ],
});
