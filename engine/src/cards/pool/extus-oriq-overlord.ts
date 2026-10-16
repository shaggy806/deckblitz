import { defineCard } from "../define.js";

// EDHREC rank 11623.
// Makes Avatar → new token "Avatar Token" (scaffolded).
//
// Rulings:
//   [2021-04-16] If an effect creates multiple copies of an instant or sorcery spell, magecraft
//     abilities trigger once for each copy created by the effect.
//   [2021-04-16] The Blood Avatar will be awakened even if no player has creatures to sacrifice
//     when it resolves.
//   [2021-04-16] Awaken the Blood Avatar’s first ability can’t reduce its cost below {B}{R}.
//     However, you can sacrifice any number of creatures, even if they won’t reduce its cost any
//     further.
//   [2021-04-16] Each magecraft ability has a different effect, although they all have the same
//     trigger condition, whenever you cast or copy an instant or sorcery spell.
//   [2021-04-16] For example, if you control Archmage Emeritus and cast an instant or sorcery
//     spell, Archmage Emeritus’s magecraft ability will trigger and you will draw a card.
//   [2021-04-16] Some effects instruct you to copy an instant or sorcery card in a zone other than
//     the stack. These copies do not cause magecraft abilities to trigger. However, most effects
//     that do this also allow you to cast the copy, and casting the copy will cause magecraft
//     abilities to trigger.
//   [2021-04-16] If an effect creates a copy of an instant or sorcery spell, this will also cause
//     the magecraft ability to trigger.
//   [2021-04-16] As Awaken the Blood Avatar resolves, first the next opponent in turn order (or,
//     if it’s an opponent’s turn, the opponent whose turn it is) chooses a creature they control,
//     then each other opponent in turn order does the same knowing the choices made before them.
//     Then all the chosen creatures are sacrificed at the same time.
//   [2021-04-16] Returning a nonlegendary creature card is not optional. If there is at least one
//     in your graveyard, you must target it with the magecraft ability.
//   [2021-04-16] Include any additional costs to cast Awaken the Blood Avatar before applying its
//     own cost reduction. For example, if Extus is your commander, and an additional cost of {6}
//     applies from the “commander tax,” you may cast Awaken the Blood Avatar by sacrificing four
//     creatures and paying {4}{B}{R}.

export default defineCard({
  name: "Extus, Oriq Overlord",
  manaCost: "{1}{W}{B}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 4,
  keywords: ["double-strike"],
  text: "Double strike\nMagecraft — Whenever you cast or copy an instant or sorcery spell, return target nonlegendary creature card from your graveyard to your hand.",
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        orCopy: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      // Not optional: with one there, it must be targeted (the ruling).
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", notSupertype: "legendary" },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "Magecraft — Whenever you cast or copy an instant or sorcery spell, return target nonlegendary creature card from your graveyard to your hand.",
    },
  ],
  faces: ["Extus, Oriq Overlord", "Awaken the Blood Avatar"],
});
