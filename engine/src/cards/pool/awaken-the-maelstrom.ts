import { defineCard } from "../define.js";

// The back face of Invasion of Alara. "Is all colors" is a
// characteristic-defining ability (rule 604.3): `colors` holds all five, as
// Fallaji Wayfarer's does. The two targets are chosen as it's cast; the
// artifact, the permanent copied and the creatures given counters are chosen
// as it resolves, in order (rule 608.2d — its ruling: you may copy the
// artifact you just put onto the battlefield, perhaps one you just drew, and
// then put counters on that token). The counters go among one to three
// creatures you control, at least one when you control any.
//
// Rulings:
//   [2023-04-14] Awaken the Maelstrom has two targets: the player who will draw cards and the
//     permanent an opponent controls that will be destroyed. You must choose legal targets for both
//     to cast Awaken the Maelstrom. All other choices are made on resolution. Specifically, this
//     means you can create a token that's a copy of the artifact you just put onto the battlefield
//     (which perhaps you just drew) and then put +1/+1 counters on that token if it's an artifact
//     creature.
//   [2023-04-14] The token copies exactly what was printed on the original permanent and nothing
//     else (unless that permanent is copying something else or is a token; see below). It doesn't
//     copy whether that permanent is tapped or untapped, whether it has any counters on it or Auras
//     and Equipment attached to it, or any non-copy effects that have changed its power,
//     toughness, types, color, and so on.
//   [2023-04-14] If the copied permanent has {X} in its mana cost, X is 0.
//   [2023-04-14] If the copied permanent is copying something else, then the token enters the
//     battlefield as whatever that permanent copied.
//   [2023-04-14] If the copied permanent is a token, the token that's created copies the original
//     characteristics of that token as stated by the effect that created that token.
//   [2023-04-14] Any enters-the-battlefield abilities of the copied permanent will trigger when the
//     token enters the battlefield. Any "as [this permanent] enters the battlefield" or "[this
//     permanent] enters the battlefield with" abilities of the copied permanent will also work.

const TEXT =
  "Target player draws two cards. You may put an artifact card from your hand onto the battlefield. Create a token that's a copy of a permanent you control. Distribute three +1/+1 counters among one, two, or three creatures you control. Destroy target permanent an opponent controls.";

export default defineCard({
  name: "Awaken the Maelstrom",
  art: "https://cards.scryfall.io/art_crop/back/3/1/318c363b-61cc-4e2f-8f86-a4287539ea07.jpg",
  colors: ["W", "U", "B", "R", "G"],
  types: ["sorcery"],
  text: `Awaken the Maelstrom is all colors.\n${TEXT}`,
  targets: ["player", { kind: "permanent", whose: "opponent", filter: {} }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2, target: 0 },
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "artifact" },
        prompt: "You may put an artifact card from your hand onto the battlefield",
      },
      {
        kind: "choose-permanents",
        filter: { controlledBy: "you" },
        min: 1,
        upTo: 1,
        prompt: "Choose a permanent you control to create a token copy of",
        then: { kind: "create-token-copy", of: 0, count: 1 },
      },
      {
        kind: "counters-distributed",
        counter: "+1/+1",
        total: 3,
        filter: { type: "creature", controlledBy: "you" },
        among: "creatures you control",
        atLeastOne: true,
      },
      { kind: "destroy", target: 1 },
    ],
  },
  faces: ["Invasion of Alara", "Awaken the Maelstrom"],
  transform: true,
});
