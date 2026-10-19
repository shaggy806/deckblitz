import { defineCard } from "../define.js";

// EDHREC rank 9292.
//
// All the ability does is set up a delayed trigger (the ruling — Together
// Forever's shape): if the creature dies this turn, the card it became in the
// graveyard comes back tapped under the ability's controller's control, only
// while it's still there (rule 400.7) — a token never does.
const TEXT =
  "{1}{B}, {T}: Choose another target artifact creature you control. When that creature dies this turn, return it to the battlefield tapped under your control.";

export default defineCard({
  name: "Cryptek",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", whose: "you", filter: { types: ["artifact", "creature"] } },
          than: "source",
        },
      ],
      effect: {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true, underYourControl: true },
        text: "When that creature dies this turn, return it to the battlefield tapped under your control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
