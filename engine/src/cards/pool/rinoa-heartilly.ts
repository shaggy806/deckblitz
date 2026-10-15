import { defineCard } from "../define.js";

// EDHREC rank 14227. Makes Angelo — a named legendary token (Mowu's shape).

const ENTER_TEXT = "When Rinoa Heartilly enters, create Angelo, a legendary 1/1 green and white Dog creature token.";
const CANNON_TEXT =
  "Angelo Cannon — Whenever Rinoa Heartilly attacks, another target creature you control gets +1/+1 until end of turn for each creature you control.";
const CREATURES = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Rinoa Heartilly",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Warlock"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${CANNON_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Angelo", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // The count is read once as it resolves, Rinoa and the target included.
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "modify-pt", target: 0, power: CREATURES, toughness: CREATURES, duration: "end-of-turn" },
      resolve: null,
      text: CANNON_TEXT,
    },
  ],
});
