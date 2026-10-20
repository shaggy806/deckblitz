import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 18312. A daybound werewolf; the back face is Moonrage Brute.
//
// Rulings:
//   [2021-09-24] A transforming permanent doesn't leave the battlefield as it transforms. If
//     Brutal Cathar transforms into Moonrage Brute, the exiled cards remain exiled. If it
//     transforms with its triggered ability on the stack, that ability will still exile the
//     target creature.
//   [2021-09-24] If Brutal Cathar leaves the battlefield before its ability resolves, the target
//     creature won't be exiled.
//   [2021-09-24] If a creature token is exiled, it ceases to exist.
//
// "Enters or transforms into Brutal Cathar" is two triggers sharing one
// effect (Brigid, Clachan's Heart's shape): entering, and a transform into
// the front face — the day half of the cycle. The O-Ring link is to the
// permanent, which transforming doesn't change, so the return trigger lives
// on both faces.

const EXILE_TEXT =
  "Whenever this creature enters or transforms into Brutal Cathar, exile target creature an opponent controls " +
  "until this creature leaves the battlefield.";

const EXILE: EffectSpec = { kind: "exile", target: 0, untilSourceLeaves: true };

export default defineCard({
  name: "Brutal Cathar",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Werewolf"],
  power: 2,
  toughness: 2,
  keywords: ["daybound"],
  text: `${EXILE_TEXT}\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: EXILE,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "transforms", who: "self", intoFront: true },
      targets: ["creature-an-opponent-controls"],
      effect: EXILE,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this creature leaves the battlefield, return the exiled card.",
    },
  ],
  faces: ["Brutal Cathar", "Moonrage Brute"],
  transform: true,
});
