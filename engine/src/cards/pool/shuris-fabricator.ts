import { defineCard } from "../define.js";

// EDHREC rank 14019.
//
// The finality counter needs no rider of its own: `moveObject` exiles a
// permanent with one that would go to a graveyard (Admiral Brass's shape).

const ENTER_TEXT =
  "When this artifact enters, create two tapped Vibranium tokens. (They're artifacts with indestructible and \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")";
const RETURN_TEXT =
  "{6}, {T}: Return target artifact card from your graveyard to the battlefield with a finality counter on it. Activate only as a sorcery. (If a permanent with a finality counter on it would be put into a graveyard, exile it instead.)";

export default defineCard({
  name: "Shuri's Fabricator",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Vibranium Token", count: 2, tapped: true },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "finality", amount: 1 } },
      resolve: null,
      text: RETURN_TEXT,
      sorcerySpeed: true,
    },
  ],
});
