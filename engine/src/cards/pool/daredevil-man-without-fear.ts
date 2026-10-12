import { defineCard } from "../define.js";

// EDHREC rank 12598. Marvel Super Heroes.
//
// Radar Sense is Vizier of the Menagerie's look at the top card, for its
// controller alone (rule 401.5). "Whenever you attack" fires once per
// declaration (Adeline's), Daredevil attacking or not. The exile is an
// optional impulse draw (Laelia's, under a `may`), and "if that card is a
// Hero card" reads the card it just exiled (`this-way`, Bonehoard
// Dracosaur's shape) — a declined exile or an empty library exiles nothing,
// so no pump.
const RADAR_TEXT = "Radar Sense — You may look at the top card of your library any time.";
const ATTACK_TEXT =
  "Whenever you attack, you may exile the top card of your library. If that card is a Hero card, Daredevil gets +2/+1 until end of turn. You may play that card this turn.";

export default defineCard({
  name: "Daredevil, Man Without Fear",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance", "haste"],
  text: `Vigilance, haste\n${RADAR_TEXT}\n${ATTACK_TEXT}`,
  looksAtOwnLibraryTop: true,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile the top card of your library?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", filter: { subtype: "Hero" } },
              then: { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
