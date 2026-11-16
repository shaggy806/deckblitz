import { defineCard } from "../define.js";

// EDHREC rank 11180. Front face. More Than Meets the Eye (rule 702.162a);
// convert is transform. The attack trigger exiles with Prowl (`linked`, rule
// 607.2a — either face's abilities are linked, 607.1b) and lets the card's
// owner play it while it stays exiled; "whenever a player plays a card exiled
// with Prowl" is `plays-card`'s `exiledWithThis`, which only this face has
// (the ruling: it triggers only while Prowl is Prowl, Stoic Strategist).

const ATTACK_TEXT =
  "Whenever Prowl attacks, exile up to one other target tapped creature or Vehicle. For as long as that card remains exiled, its owner may play it.";
const PLAY_TEXT = "Whenever a player plays a card exiled with Prowl, you draw a card and convert Prowl.";

export default defineCard({
  name: "Prowl, Stoic Strategist",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 3,
  toughness: 3,
  text: `More Than Meets the Eye {2}{W} (You may cast this card converted for {2}{W}.)\n${ATTACK_TEXT}\n${PLAY_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "other",
            of: { kind: "permanent", filter: { tapped: true, anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
          },
        },
      ],
      effect: { kind: "exile", target: 0, linked: true, mayPlay: { duration: "while-exiled", byOwner: true, play: true } },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "plays-card", who: "any", exiledWithThis: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: PLAY_TEXT,
    },
  ],
  faces: ["Prowl, Stoic Strategist", "Prowl, Pursuit Vehicle"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{2}{W}" },
});
