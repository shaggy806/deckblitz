import { defineCard } from "../define.js";

const GRANTED = "{T}: Target attacking or blocking creature gets +3/+3 until end of turn.";
const TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1 and has "${GRANTED}"`;

export default defineCard({
  name: "Vigilant Sentry",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["attacking-or-blocking-creature"],
          effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
