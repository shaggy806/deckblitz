import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] If Totentanz, Swarm Piper dies at the same time as one or more other nontoken
//     creatures you control, Totentanz's ability triggers for each of them.
// "Totentanz or another nontoken creature" is two triggers: its own death (whatever it is — a
// token copy of it included), and each other nontoken creature you control dying.

const DIES =
  "Whenever Totentanz or another nontoken creature you control dies, create a 1/1 black Rat creature token with \"This token can't block.\"";
const DEATHTOUCH = "{1}{B}: Target attacking Rat you control gains deathtouch until end of turn.";

export default defineCard({
  name: "Totentanz, Swarm Piper",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock", "Bard"],
  power: 2,
  toughness: 3,
  text: `${DIES}\n${DEATHTOUCH}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Rat", attacking: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: DEATHTOUCH,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Rat Token (Can't Block)", count: 1 },
      resolve: null,
      text: DIES,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Rat Token (Can't Block)", count: 1 },
      resolve: null,
      text: DIES,
    },
  ],
});
