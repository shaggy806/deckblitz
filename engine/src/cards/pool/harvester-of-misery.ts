import { defineCard } from "../define.js";

// EDHREC rank 14848.
//
// The enters trigger is Shefet Archfiend's: the creatures there as it
// resolves, and no other (the ruling). The last ability is activated from the
// hand, discarding the card as its cost (a `zone: "hand"` ability, channel's
// shape).
const ENTERS_TEXT = "When this creature enters, other creatures get -2/-2 until end of turn.";
const DISCARD_TEXT = "{1}{B}, Discard this card: Target creature gets -2/-2 until end of turn.";

export default defineCard({
  name: "Harvester of Misery",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${ENTERS_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -2,
        toughness: -2,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: DISCARD_TEXT,
      zone: "hand",
    },
  ],
});
