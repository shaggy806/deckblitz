import { defineCard } from "../define.js";

const OWN_TEXT = "{1}, {T}: Exile target creature you control.";
const THEIRS_TEXT = "{7}, {T}: Exile target creature you don't control.";
const RETURN_TEXT =
  "When Helvault is put into a graveyard from the battlefield, return all cards exiled with it to the battlefield under their owners' control.";

// Both exile abilities are linked to the third (rule 607.2a, the ruling): only
// cards Helvault itself exiled come back, together, each under its owner's
// control. Leaving to anywhere but a graveyard returns nothing.
export default defineCard({
  name: "Helvault",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${OWN_TEXT}\n${THEIRS_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: OWN_TEXT,
    },
    {
      cost: { mana: "{7}", tap: true },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: THEIRS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
