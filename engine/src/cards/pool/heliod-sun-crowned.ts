import { defineCard } from "../define.js";

// EDHREC rank 1016.
//
// Rulings:
//   [2020-01-24] Heliod can be the target of its own triggered ability.
//   [2020-01-24] A noncreature enchantment with a +1/+1 counter on it will be unaffected by that
//     counter until it becomes a creature, at which time it will get +1/+1 for that counter.
//   [2020-01-24] When a God enters the battlefield, your devotion to its color (including the mana
//     symbols in the mana cost of the God itself) will determine if a creature entered the
//     battlefield or not for abilities that trigger whenever a creature enters the battlefield.
//   [2020-01-24] Counters put on a God remain on it while it's not a creature, even if they have
//     no effect.
//   [2020-01-24] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2020-01-24] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it's still on the battlefield at that time.
//   [2020-01-24] In a Two-Headed Giant game, life gained by your teammate won't cause the ability
//     to trigger, even though it caused your team's life total to increase.
//   [2020-01-24] Multiple instances of lifelink on the same creature are redundant.
//   [2020-01-24] If a God stops being a creature, it loses the type creature and the creature type
//     God. It continues to be a legendary enchantment.
//   [2020-01-24] Mana symbols in the text boxes of permanents you control don't count toward your
//     devotion to any color.
//   [2020-01-24] The abilities of Gods function as long as they're on the battlefield, regardless
//     of whether they're creatures.
//   [2020-01-24] The type-changing ability that can make a God not be a creature functions only on
//     the battlefield. It's always a creature card in other zones, regardless of your devotion to
//     its color. It's always a creature spell while it's on the stack.
//   [2020-01-24] If you put an Aura on an opponent's permanent, you still control the Aura, and
//     mana symbols in its mana cost count towards your devotion.
//   [2020-01-24] Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana
//     costs of permanents you control don't count toward your devotion to any color.
//   [2020-01-24] If a God is attacking or blocking and it stops being a creature, it will be
//     removed from combat. It won't rejoin combat if it resumes being a creature later during that
//     combat.
//   [2020-01-24] If an effect causes a God to lose all abilities, its ability that causes it to
//     stop being a creature still applies if appropriate.
//   [2020-01-24] As a God enters the battlefield, your devotion to its color will determine
//     whether any replacement effects that affect creatures entering the battlefield apply to that
//     God. Because replacement effects are considered before the God is on the battlefield, the
//     mana symbols in its mana cost won't be counted when determining this.
//   [2020-01-24] Heliod's triggered ability triggers just once for each life-gaining event,
//     whether it's 1 life from Daxos, Blessed by the Sun or 3 life from Cling to Dust. If you gain
//     an amount of life "for each" of something or "equal to the number" of something, that life
//     is gained as one event and Heliod's ability triggers only once.
//   [2020-01-24] If a creature is dealt lethal damage at the same time that you gain life, it
//     can't receive a counter from Heliod's ability in time to save it.
//   [2023-07-28] Each creature with lifelink dealing combat damage causes a separate life-gaining
//     event. For example, if two creatures you control with lifelink deal combat damage at the
//     same time, Heliod's ability will trigger twice. However, if a single creature you control
//     with lifelink deals combat damage to multiple creatures, players, planeswalkers, and/or
//     battles at the same time (perhaps because it has trample or was blocked by more than one
//     creature), the ability will trigger only once.

export default defineCard({
  name: "Heliod, Sun-Crowned",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 5,
  keywords: ["indestructible"],
  text: "Indestructible\nAs long as your devotion to white is less than five, Heliod isn't a creature.\nWhenever you gain life, put a +1/+1 counter on target creature or enchantment you control.\n{1}{W}: Another target creature gains lifelink until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}: Another target creature gains lifelink until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { typesAnyOf: ["creature", "enchantment"] },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you gain life, put a +1/+1 counter on target creature or enchantment you control.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "devotion", colors: ["W"], atMost: 4 },
      removeTypes: ["creature"],
      text: "As long as your devotion to white is less than five, Heliod isn't a creature.",
    },
  ],
});
