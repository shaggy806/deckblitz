import { defineCard } from "../define.js";

// EDHREC rank 13917.
//
// Rulings:
//   [2013-01-24] Gideon, Champion of Justice's power and toughness are set to the number of
//     loyalty counters on him when his second ability resolves. They won't change later in the
//     turn if the number of loyalty counters on him changes.
//   [2013-01-24] Say you activate Gideon, Champion of Justice's second ability, and then an
//     opponent gains control of him before combat. You may have any of your creatures attack
//     Gideon, Champion of Justice (since he's still a planeswalker). Then Gideon, Champion of
//     Justice may block (since he's a creature). He may block any eligible attacking creature,
//     including one that's attacking him! During combat, he behaves as an attacked planeswalker
//     and/or a blocking creature, as appropriate. For example, he deals combat damage to any
//     creatures he's blocking, but he doesn't deal combat damage to any unblocked creatures that
//     are attacking him.
//   [2013-01-24] Gideon, Champion of Justice's second ability causes him to become a creature with
//     the creature types Human and Soldier. He remains a planeswalker with the planeswalker type
//     Gideon. (He also retains any other card types or subtypes he may have had.) Each subtype is
//     correlated to the proper card type: Gideon is just a planeswalker type (not a creature
//     type), and Human and Soldier are just creature types (not planeswalker types).
//   [2013-01-24] You put a loyalty counter on Gideon, Champion of Justice as part of the cost of
//     activating the first ability. When that ability resolves, you count the number of creatures
//     controlled by the target opponent and put that many additional loyalty counters on Gideon.
//   [2013-01-24] If Gideon, Champion of Justice becomes a creature the same turn he enters, you
//     can't attack with him or use any of his {T} abilities (if he gains any).
//   [2013-01-24] If the first ability doesn't resolve (perhaps because the target opponent is an
//     illegal target when the ability tries to resolve), you won't put any additional loyalty
//     counters on Gideon, although the loyalty counter you put on him to activate the ability will
//     remain.
//   [2013-01-24] If Gideon, Champion of Justice becomes a creature due to his second ability, that
//     doesn't count as having a creature enter. Gideon was already on the battlefield; he only
//     changed his types. Abilities that trigger whenever a creature enters won't trigger.
//   [2013-07-01] If damage that can't be prevented is dealt to Gideon, Champion of Justice after
//     his second ability has resolved, that damage will have all applicable results: specifically,
//     the damage is marked on Gideon (since he's a creature) and that damage causes that many
//     loyalty counters to be removed from him (since he's a planeswalker). Even though he has
//     indestructible, if Gideon, Champion of Justice has no loyalty counters on him, he's put into
//     his owner's graveyard as a state-based action.

export default defineCard({
  name: "Gideon, Champion of Justice",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Gideon"],
  loyalty: 4,
  text: "+1: Put a loyalty counter on Gideon for each creature target opponent controls.\n0: Until end of turn, Gideon becomes a Human Soldier creature with power and toughness each equal to the number of loyalty counters on him and gains indestructible. He's still a planeswalker. Prevent all damage that would be dealt to him this turn.\n−15: Exile all other permanents.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      // Counted as it resolves; an illegal target means no counters (the
      // rulings) — `forTarget` reads 0 for an illegal slot.
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "loyalty",
        amount: { countOf: { type: "creature", controlledBy: "you" }, forTarget: 0 },
      },
      resolve: null,
      text: "+1: Put a loyalty counter on Gideon for each creature target opponent controls.",
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      // P/T are read once, as the ability resolves (the ruling: they don't
      // change later in the turn with his loyalty).
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: { countersOn: "source", counter: "loyalty" },
            toughness: { countersOn: "source", counter: "loyalty" },
            addTypes: ["creature"],
            addSubtypes: ["Human", "Soldier"],
            keywords: ["indestructible"],
            duration: "end-of-turn",
          },
          { kind: "prevent-damage", target: "source", amount: "all" },
        ],
      },
      resolve: null,
      text: "0: Until end of turn, Gideon becomes a Human Soldier creature with power and toughness each equal to the number of loyalty counters on him and gains indestructible. He's still a planeswalker. Prevent all damage that would be dealt to him this turn.",
    },
    {
      loyaltyCost: -15,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "exile-all", filter: {}, exceptSource: true },
      resolve: null,
      text: "−15: Exile all other permanents.",
    },
  ],
});
