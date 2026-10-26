import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 31171.

export default defineCard({
  name: "Safehold Sentry",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  text: "{2}{W}, {Q}: This creature gets +0/+2 until end of turn. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false, untap: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{W}, {Q}: This creature gets +0/+2 until end of turn.",
    },
  ],
});
