import { defineCard } from "../define.js";

// EDHREC rank 13017. Marvel Super Heroes Commander.
//
// The second ability is two events, Syr Konrad's shape: another artifact
// put into **your** graveyard (one you own — `ownedBy`, whoever controlled
// it, as it last existed; an artifact token you own counts, rule 111.7) from
// the battlefield, and an artifact card put there from anywhere else (once
// per card).
const MAKE_TEXT = "Whenever Ultron enters or attacks, create a 2/2 colorless Robot Villain artifact creature token.";
const DRAIN_TEXT =
  "Whenever another artifact is put into your graveyard from the battlefield or an artifact card is put into your graveyard from anywhere other than the battlefield, each opponent loses 1 life.";
const make = { kind: "create-token", token: "Robot Villain Token", count: 1 } as const;
const drain = { kind: "lose-life", amount: 1, who: "each-opponent" } as const;

export default defineCard({
  name: "Ultron the Annihilator",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${MAKE_TEXT}\n${DRAIN_TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: make, resolve: null, text: MAKE_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: make, resolve: null, text: MAKE_TEXT },
    {
      trigger: { on: "dies", who: "any", otherOnly: true, filter: { type: "artifact", ownedBy: "you" } },
      targets: [],
      effect: drain,
      resolve: null,
      text: DRAIN_TEXT,
    },
    {
      trigger: { on: "put-into-graveyard", who: "you", notFrom: "battlefield", filter: { type: "artifact" } },
      targets: [],
      effect: drain,
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
