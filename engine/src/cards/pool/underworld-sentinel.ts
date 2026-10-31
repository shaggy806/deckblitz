import { defineCard } from "../define.js";

// The cards are exiled with this creature (rule 607.2a), and its dies
// trigger reaches them though it has left the battlefield. "Put … onto the
// battlefield" names no controller, so they enter under the control of the
// player putting them there — the trigger's controller (rule 110.2a).

const ATTACK = "Whenever this creature attacks, exile target creature card from your graveyard.";
const DIES = "When this creature dies, put all cards exiled with it onto the battlefield.";

export default defineCard({
  name: "Underworld Sentinel",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Soldier"],
  power: 4,
  toughness: 5,
  text: `${ATTACK}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: ATTACK,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield", under: "you" },
      resolve: null,
      text: DIES,
    },
  ],
});
