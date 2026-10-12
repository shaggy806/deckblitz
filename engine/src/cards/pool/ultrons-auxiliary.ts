import { defineCard } from "../define.js";

// EDHREC rank 19568. Marvel Super Heroes Commander.
//
// Ultron the Annihilator's two events: another artifact put into **your**
// graveyard (one you own — `ownedBy`, whoever controlled it, as it last
// existed; an artifact token you own counts, rule 111.7) from the
// battlefield, and an artifact card put there from anywhere else (once per
// card).
const TEXT =
  "Whenever another artifact is put into your graveyard from the battlefield or an artifact card is put into your graveyard from anywhere other than the battlefield, put a +1/+1 counter on this creature.";
const grow = { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } as const;

export default defineCard({
  name: "Ultron's Auxiliary",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", otherOnly: true, filter: { type: "artifact", ownedBy: "you" } },
      targets: [],
      effect: grow,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "put-into-graveyard", who: "you", notFrom: "battlefield", filter: { type: "artifact" } },
      targets: [],
      effect: grow,
      resolve: null,
      text: TEXT,
    },
  ],
});
