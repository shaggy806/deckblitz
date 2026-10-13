import { defineCard } from "../define.js";

// EDHREC rank 3597.
//
// Rulings:
//   [2020-01-24] Counters put on a God remain on it while it’s not a creature, even if they have
//     no effect.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won’t rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it’s still on the battlefield at that time.
//   [2020-01-24] If you don’t put the revealed noncreature card into your graveyard, it remains on
//     top of your library.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won’t be counted when determining this.
//   [2020-01-24] If you put an Aura on an opponent’s permanent, you still control the Aura, and
//     mana symbols in its mana cost count towards your devotion.
//   [2020-01-24] The abilities of Gods function as long as they’re on the battlefield, regardless
//     of whether they’re creatures.
//   [2020-01-24] Mana symbols in the text boxes of permanents you control don’t count toward your
//     devotion to any color.
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It’s always a creature card in other zones, regardless of your devotion to
//     its color. It’s always a creature spell while it’s on the stack.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana
//     costs of permanents you control don’t count toward your devotion to any color.

export default defineCard({
  name: "Nylea, Keen-Eyed",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 6,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to green is less than five, Nylea isn't a creature.\nCreature spells you cast cost {1} less to cast.\n{2}{G}: Reveal the top card of your library. If it's a creature card, put it into your hand. Otherwise, you may put it into your graveyard.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      // Sarinth Steelseeker's shape, revealed: a creature card must go to
      // hand (`min: 1` — it's the only card), anything else may go to the
      // graveyard or stay on top.
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        secondPick: { min: 0, max: 1, destination: "graveyard" },
        leftover: "stay",
      },
      resolve: null,
      text: "{2}{G}: Reveal the top card of your library. If it's a creature card, put it into your hand. Otherwise, you may put it into your graveyard.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["G"], atMost: 4 },
      removeTypes: ["creature"],
      text: "As long as your devotion to green is less than five, Nylea isn't a creature.",
    },
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature" }, caster: "you", reduceGeneric: 1 },
      text: "Creature spells you cast cost {1} less to cast.",
    },
  ],
});
