import { defineCard } from "../define.js";

const ETB_TEXT =
  "When Gwyndala enters, create a colorless Equipment artifact token named Neuroflux Heirloom with \"Equipped creature gets +1/+1\" and equip {2}. Attach it to Gwyndala.";
const COPY_TEXT =
  "{2}: Each Equipment token you control becomes a copy of target Equipment you control until end of turn.";

export default defineCard({
  name: "Gwyndala, the Progeny",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vau-N'Akat", "Advisor"],
  power: 1,
  toughness: 1,
  text: `${ETB_TEXT}\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Equipment" } }],
      // Every matching token at once, each copying the target as it was before any of them did.
      effect: {
        kind: "become-copy",
        filter: { subtype: "Equipment", token: true, controlledBy: "you" },
        of: 0,
        until: "end-of-turn",
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Neuroflux Heirloom Token", count: 1 },
          { kind: "attach", target: "source", attachments: { subtype: "Equipment", thisWay: "created" } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
