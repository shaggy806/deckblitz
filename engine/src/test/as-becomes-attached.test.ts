/**
 * "As this Equipment becomes attached to a creature, choose a creature card
 * name and a creature type" (Psychic Paper — the need key
 * `decision:choose-name-and-type-on-attach`): `CardDefinition.asBecomesAttached`,
 * done by its controller however it becomes attached, its answers kept on it
 * (`remember`), and a static reading the last ones (`setsChosenName`,
 * `setsChosenCreatureType`).
 */
import { describe, expect, it } from "vitest";

import { nameOf } from "../state.js";
import { B, activate, cast, keywords, lands, ref, spawn, subtypes, table, toHand } from "./harness.js";

describe("Psychic Paper", () => {
  it("names the equipped creature and gives it the chosen creature type, ward 1 and can't be blocked", () => {
    const { game, a } = table();
    const paper = spawn(game, "Psychic Paper");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    let typesOffered: readonly string[] = [];
    a.chooseCardNameFn = (_view, _source, options) => {
      expect(options).toContain("Llanowar Elves");
      expect(options).not.toContain("Lightning Bolt");
      return "Llanowar Elves";
    };
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      typesOffered = options;
      return "Elf";
    };
    expect(nameOf(game.state.objects[bears])).toBe("Grizzly Bears");
    activate(game, paper, 0, { targets: [ref(bears)] });
    // Creature types only (the ruling).
    expect(typesOffered).toContain("Elf");
    expect(typesOffered).not.toContain("Artifact");
    expect(game.state.objects[paper].chosenNames).toEqual(["Llanowar Elves"]);
    expect(nameOf(game.state.objects[bears])).toBe("Llanowar Elves");
    expect(subtypes(game, bears)).toEqual(["Elf"]);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });

  it("chooses again each time it becomes attached; the creature it leaves is itself again", () => {
    const { game, a } = table();
    const paper = spawn(game, "Psychic Paper");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Wastes", 4);
    const names = ["Llanowar Elves", "Serra Angel"];
    const kinds = ["Elf", "Angel"];
    a.chooseCardNameFn = () => names.shift() ?? "Llanowar Elves";
    a.chooseCreatureTypeFn = () => kinds.shift() ?? "Elf";
    activate(game, paper, 0, { targets: [ref(bears)] });
    activate(game, paper, 0, { targets: [ref(giant)] });
    expect(nameOf(game.state.objects[bears])).toBe("Grizzly Bears");
    expect(subtypes(game, bears)).toEqual(["Bear"]);
    expect(nameOf(game.state.objects[giant])).toBe("Serra Angel");
    expect(subtypes(game, giant)).toEqual(["Angel"]);
  });

  it("chooses when another effect attaches it too, its controller choosing", () => {
    const { game, a, b } = table();
    const paper = spawn(game, "Psychic Paper", B);
    const bears = spawn(game, "Grizzly Bears");
    let asked = 0;
    a.chooseCardNameFn = () => {
      throw new Error("alice doesn't control Psychic Paper");
    };
    b.chooseCardNameFn = () => {
      asked += 1;
      return "Serra Angel";
    };
    b.chooseCreatureTypeFn = () => "Angel";
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Magnetic Theft"), { targets: [ref(paper), ref(bears)] });
    expect(game.state.objects[paper].attachedTo).toBe(bears);
    expect(asked).toBe(1);
    expect(nameOf(game.state.objects[bears])).toBe("Serra Angel");
    expect(subtypes(game, bears)).toEqual(["Angel"]);
  });
});
