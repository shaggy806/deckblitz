import { defineCard } from "../define.js";

// Playtest card. X is Ratatwotwo's power as the trigger resolves, or as it last existed if it has
// left (rule 608.2h).

const ENTERS =
  'When Ratatwotwo enters the battlefield, create a Chef Role token attached to up to one other target creature you control. (Enchanted creature gets +1/+1 and has "Whenever this creature attacks, create a Food token.")';
const PUMP =
  "Whenever a creature you control enchanted by a Chef Role attacks or blocks, it gets +X/+X until end of turn, where X is Ratatwotwo's power.";
const CHEF = { type: "creature", attachments: { filter: { name: "Chef Role Token" } } } as const;
const BOOST = {
  kind: "modify-pt",
  target: "trigger-object",
  power: { powerOf: "source" },
  toughness: { powerOf: "source" },
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Ratatwotwo",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 2,
  text: `${ENTERS}\n${PUMP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: { kind: "create-token", token: "Chef Role Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "attacks", who: "you-control", filter: CHEF },
      targets: [],
      effect: BOOST,
      resolve: null,
      text: PUMP,
    },
    {
      trigger: { on: "blocks", who: "you-control", filter: CHEF },
      sameAbilityAs: 1,
      targets: [],
      effect: BOOST,
      resolve: null,
      text: PUMP,
    },
  ],
});
