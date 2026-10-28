import { defineCard } from "../define.js";

// EDHREC rank 4530.
//
// "This creature or another Goblin": one ability with two trigger events
// (`sameAbilityAs`), so it triggers on its own death even if it has stopped
// being a Goblin. The card is exiled whatever it is; only a Goblin creature
// card may be cast (`filter`, `castOnly`), until the end of your next turn.

const TEXT =
  "Whenever this creature or another Goblin you control dies, exile the top card of your library. If it's a Goblin creature card, you may cast that card until the end of your next turn.";

const EFFECT = {
  kind: "impulse-exile",
  amount: 1,
  duration: "your-next-turn",
  castOnly: true,
  filter: { type: "creature", subtype: "Goblin" },
} as const;

export default defineCard({
  name: "Rundvelt Hordemaster",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  text: `Other Goblins you control get +1/+1.\n${TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Goblin" },
      grantPt: [1, 1],
      text: "Other Goblins you control get +1/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { subtype: "Goblin" }, otherOnly: true },
      sameAbilityAs: 0,
      targets: [],
      effect: EFFECT,
      resolve: null,
      text: TEXT,
    },
  ],
});
