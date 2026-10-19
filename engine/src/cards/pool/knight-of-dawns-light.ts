import { defineCard } from "../define.js";

// EDHREC rank 11970.
//
// Rulings:
//   Each creature with lifelink dealing combat damage causes a separate life-gaining event. For
//     example, if two creatures you control with lifelink deal combat damage at the same time,
//     Knight of Dawn's Light's second ability will apply to those two events separately. However,
//     if a single creature you control with lifelink deals combat damage to multiple creatures,
//     players, and/or planeswalkers at the same time (perhaps because it has trample or was
//     blocked by more than one creature), the ability will apply only once.
//   The middle ability of Knight of Dawn's Light applies just once to each life-gaining event, no
//     matter how much life is gained. If you gain an amount of life "for each" of something or
//     "equal to the number" of something, that life is gained as one event and the ability of
//     Knight of Dawn's Light applies only once.
//   If you control two Knight of Dawn's Lights and you would gain life, you gain that much life
//     plus 2. A third Knight of Dawn's Light has you gain that much life plus 3, and so on.
//   In a Two-Headed Giant game, life gained by your teammate won't cause Knight of Dawn's Light's
//     second ability to apply, even though it will cause your team's life total to increase.
const GAIN_TEXT = "If you would gain life, you gain that much life plus 1 instead.";
const PUMP_TEXT = "{1}{W}: This creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Knight of Dawn's Light",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${GAIN_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "you", plus: 1 },
      text: GAIN_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
