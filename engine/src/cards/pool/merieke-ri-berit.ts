import { defineCard } from "../define.js";

// Ice Age (Time Spiral's timeshifted sheet). EDHREC rank 14449; top-1000 commander #967.
//
// Rulings:
//   If Merieke becomes untapped, its "destroy" ability will trigger, but you won't lose control of
//     the creature you took before it's destroyed.
//   If another player takes control of Merieke, you will immediately lose control of the creature
//     you took, but Merieke's "destroy" ability won't trigger. The affected creature will go back
//     under the control of the appropriate player.
//   If Merieke leaves the battlefield, you will immediately lose control of the creature you took
//     and Merieke's "destroy" ability will trigger. The affected creature will go back under the
//     control of the appropriate player, then it will be destroyed.
//
// The control lasts for as long as you control Merieke (`whileYouControlSource`),
// not while it stays tapped. "When Merieke leaves the battlefield or becomes
// untapped" is one delayed triggered ability made as the ability resolves
// (rule 603.7), The Pandorica's shape: a `becomes-untapped` watch of the
// source with `orLeaves`, `once` — whichever comes first uses it up.

const NO_UNTAP = "Merieke Ri Berit doesn't untap during your untap step.";
const STEAL =
  "{T}: Gain control of target creature for as long as you control Merieke Ri Berit. When Merieke Ri Berit leaves the battlefield or becomes untapped, destroy that creature. It can't be regenerated.";

export default defineCard({
  name: "Merieke Ri Berit",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: `${NO_UNTAP}\n${STEAL}`,
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: NO_UNTAP }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
          {
            kind: "delayed-trigger",
            at: {
              whenever: { on: "event", event: "becomes-untapped", who: "self" },
              watching: "source",
              until: "permanent",
              once: true,
              orLeaves: "source",
            },
            effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
            text: "When Merieke Ri Berit leaves the battlefield or becomes untapped, destroy that creature. It can't be regenerated.",
          },
        ],
      },
      resolve: null,
      text: STEAL,
    },
  ],
});
