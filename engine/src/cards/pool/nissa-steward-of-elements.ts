import { defineCard } from "../define.js";

// EDHREC rank 6941.
//
// Rulings:
//   [2017-04-18] Once Nissa's second ability begins to resolve, no player may take actions until
//     it's done. Notably, players can't try to change Nissa's loyalty once you look at the card or
//     choose to put it onto the battlefield.
//   [2017-04-18] If X is 0, Nissa enters the battlefield with no loyalty and is put into her
//     owner's graveyard before you can activate her abilities.
//   [2017-04-18] Nissa's last ability sets the base power and toughness of the lands to 5/5. Any
//     +1/+1 or -1/-1 counters that were on those lands will apply to those values.
//   [2017-04-18] While resolving Nissa's second ability, if you can't or don't put the card onto
//     the battlefield, it remains on top of your library.
//   [2017-04-18] If Nissa leaves the battlefield while her second ability is on the stack, use her
//     last known loyalty to determine whether you may put the top card of your library onto the
//     battlefield. If Nissa left the battlefield because she took enough damage to reduce her
//     loyalty to 0, then her last known loyalty is 0.
//
// Loyalty X (rule 306.5b, 107.3m): she enters with X loyalty counters, X as
// she was cast — Walking Ballista's replacement — and with none put onto the
// battlefield any other way. A printed loyalty of X has no number, so
// `loyalty` is left unset rather than synthesizing a fixed starting count.

export default defineCard({
  name: "Nissa, Steward of Elements",
  manaCost: "{X}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nissa"],
  text: "+2: Scry 2.\n0: Look at the top card of your library. If it's a land card or a creature card with mana value less than or equal to the number of loyalty counters on Nissa, you may put that card onto the battlefield.\n−6: Untap up to two target lands you control. They become 5/5 Elemental creatures with flying and haste until end of turn. They're still lands.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "loyalty", amount: "x" } },
      text: "Nissa, Steward of Elements enters with X loyalty counters.",
    },
  ],
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "+2: Scry 2.",
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      // Her loyalty as the ability resolves — as she last existed if she has
      // left. A card she can't or doesn't put onto the battlefield stays on
      // top (the rulings).
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        filter: {
          anyOf: [
            { type: "land" },
            {
              type: "creature",
              manaValue: { op: "lte", n: { amount: { countersOn: "source", counter: "loyalty" } } },
            },
          ],
        },
        destination: "battlefield",
        leftover: "stay",
      },
      resolve: null,
      text: "0: Look at the top card of your library. If it's a land card or a creature card with mana value less than or equal to the number of loyalty counters on Nissa, you may put that card onto the battlefield.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: { kind: "permanent", whose: "you", filter: { type: "land" } }, max: 2 }],
      // Sets their base power and toughness: counters still apply (the ruling).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "untap", target: 0 } },
          {
            kind: "for-each-target",
            from: 0,
            effect: {
              kind: "animate",
              target: 0,
              power: 5,
              toughness: 5,
              addTypes: ["creature"],
              addSubtypes: ["Elemental"],
              keywords: ["flying", "haste"],
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: "−6: Untap up to two target lands you control. They become 5/5 Elemental creatures with flying and haste until end of turn. They're still lands.",
    },
  ],
});
