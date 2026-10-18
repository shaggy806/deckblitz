import { defineCard } from "../define.js";

// EDHREC rank 8816.
//
// Rulings:
//   [2023-02-04] If the copied creature has {X} in its mana cost, X is 0.
//   [2023-02-04] Except for the listed exceptions, the token copies exactly what was printed on the
//     original permanent and nothing else (unless that permanent is copying something else or it
//     is a token; see below). It doesn't copy whether that creature is tapped or untapped, whether
//     it has any counters on it or Auras and Equipment attached to it, and so on.
//   [2023-02-04] Any enters-the-battlefield abilities of the copied permanent will trigger when the
//     token enters the battlefield. Any "as [this permanent] enters the battlefield" or "[this
//     permanent] enters the battlefield with" abilities of the chosen permanent will also work.
//   [2023-02-04] If the copied permanent is copying something else, then the token enters the
//     battlefield as whatever that permanent copied, with the exceptions noted above.
//   [2023-02-04] For the middle loyalty ability, each opponent in turn order chooses whether or not
//     to scry. Those who do (likely all of them) look at the top card of their library at the same
//     time, then they decide in turn order where their card goes. Each opponent will know the
//     choices of previous players in turn order before making their own choices.
//   [2023-02-04] If the copied creature is a token, the new token that's created copies the
//     original characteristics of that token as stated by the effect that created that token, with
//     the exceptions noted above.
//   [2023-02-04] Kaya's last ability checks to see whether the permanent was an Aura when it last
//     existed on the battlefield, not whether it is an Aura card in exile. For example, if an
//     enchantment creature with the bestow ability (an ability that allows a creature card to be
//     cast as an Aura instead) is an Aura and the target of Kaya's last ability, the ability will
//     not create a copy of it.

// "Each opponent may scry 1" is Model of Unity's `each-player-may`. The −3's
// "if it wasn't an Aura" is a `target` condition, which reads the exiled
// permanent as it last existed on the battlefield (the last ruling); the
// token copies it as it last existed there too (rule 608.2h — what it was
// copying, a token's original characteristics), and Kaya's controller
// creates it (`who: "you"`). White replaces its colours; creature and Spirit
// are in addition to its other types.
const PLUS_TEXT = "+2: Each opponent loses 3 life and you gain 3 life.";
const ZERO_TEXT = "0: You draw two cards. Then each opponent may scry 1.";
const MINUS_TEXT =
  "−3: Exile target creature or enchantment. If it wasn't an Aura, create a token that's a copy of it, except it's a 1/1 white Spirit creature with flying in addition to its other types.";

export default defineCard({
  name: "Kaya, Intangible Slayer",
  manaCost: "{3}{W}{W}{B}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kaya"],
  loyalty: 6,
  keywords: ["hexproof"],
  text: `Hexproof\n${PLUS_TEXT}\n${ZERO_TEXT}\n${MINUS_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 3, who: "each-opponent" },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "each-player-may", who: "each-opponent", prompt: "Scry 1?", effect: { kind: "scry", amount: 1 } },
        ],
      },
      resolve: null,
      text: ZERO_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "enchantment"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { notSubtypes: ["Aura"] } },
            then: {
              kind: "create-token-copy",
              of: 0,
              count: 1,
              who: "you",
              exceptions: {
                basePt: [1, 1],
                setColors: ["W"],
                addTypes: ["creature"],
                addSubtypes: ["Spirit"],
                keywords: ["flying"],
              },
            },
          },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
});
