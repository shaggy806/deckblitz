import { defineCard } from "../define.js";

// "Tap all creatures defending player controls" is the attack trigger's player
// (`controlledByRef: "trigger-player"`): only the player this creature
// attacks, or the controller of the planeswalker it attacks (the ruling). The last ability
// moves the card out of exile, so it works only there (rule 113.6m): `zone:
// "exile"`, its owner's to activate (rule 602.2), the card staying put until
// it resolves.

const ATTACK_TEXT = "Whenever this creature attacks, tap all creatures defending player controls.";
const EXILE_TEXT = "{3}{B/G}{B/G}: Put this card from exile onto the battlefield tapped. Activate only as a sorcery.";

export default defineCard({
  name: "Torrent Elemental",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "creature", controlledByRef: "trigger-player" } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B/G}{B/G}", tap: false },
      targets: [],
      zone: "exile",
      staysInZone: true,
      sorcerySpeed: true,
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
