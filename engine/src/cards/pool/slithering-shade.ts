import { defineCard } from "../define.js";

// EDHREC rank 29262.
//
// Checked as attackers are declared: one that gets a card in hand afterwards
// keeps attacking (the ruling).

const HELLBENT_TEXT =
  "Hellbent — This creature can attack as though it didn't have defender as long as you have no cards in hand.";

export default defineCard({
  name: "Slithering Shade",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Shade"],
  power: 0,
  toughness: 1,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n{B}: This creature gets +1/+1 until end of turn.\n${HELLBENT_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{B}: This creature gets +1/+1 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      canAttackAsThoughNoDefender: true,
      text: HELLBENT_TEXT,
    },
  ],
});
