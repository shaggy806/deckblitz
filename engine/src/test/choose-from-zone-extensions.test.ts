/**
 * Choice extensions (`decision:choose-from-zone-extensions`): a search whose
 * finds must each have a different name (Tiamat — the zone choice's
 * `distinct` rule), "any number of cards with four or more card types among
 * them" (the `variety` rule), and one choice over a hand and a graveyard
 * together (Kastral, the Windcrested's `return-from-graveyard` `from:
 * "hand-or-graveyard"`).
 */
import { describe, expect, it } from "vitest";

import { fitsTogether } from "../zone-choice-together.js";
import type { ZoneChoiceTogether } from "../zone-choice-together.js";
import type { ObjectId } from "../primitives.js";

import { attack, cast, counters, lands, pickFromZone, pickModes, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

const id = (s: string) => s as ObjectId;

describe("the zone choice's together rules", () => {
  it("distinct: no two chosen cards share a tag", () => {
    const rule: ZoneChoiceTogether = { rule: "distinct", tags: { a: ["X"], b: ["Y"], c: ["X"] }, text: "" };
    expect(fitsTogether(rule, [id("a"), id("b")])).toBe(true);
    expect(fitsTogether(rule, [id("a"), id("c")])).toBe(false);
  });

  it("variety: enough different tags among them, or none with orNone", () => {
    const rule: ZoneChoiceTogether = {
      rule: "variety",
      tags: { a: ["creature", "artifact"], b: ["land"], c: ["instant"], d: ["creature"] },
      text: "",
      atLeast: 4,
      orNone: true,
    };
    expect(fitsTogether(rule, [id("a"), id("b"), id("c")])).toBe(true);
    expect(fitsTogether(rule, [id("a"), id("b"), id("d")])).toBe(false);
    expect(fitsTogether(rule, [])).toBe(true);
  });
});

describe("Tiamat", () => {
  it("searches for up to five Dragons not named Tiamat that each have different names", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const shivan = toLibrary(game, "Shivan Dragon");
    const shivan2 = toLibrary(game, "Shivan Dragon");
    const other = toLibrary(game, "Tiamat");
    const glorybringer = toLibrary(game, "Glorybringer");
    let offered: readonly ObjectId[] = [];
    let rule: ZoneChoiceTogether | undefined;
    a.chooseFromZoneFn = (view, eligible) => {
      offered = eligible;
      const awaiting = view.state.awaiting;
      rule = awaiting?.kind === "choose-from-zone" ? awaiting.together : undefined;
      return [shivan, glorybringer];
    };
    cast(game, toHand(game, "Tiamat"));
    expect(offered).toEqual(expect.arrayContaining([shivan, shivan2, glorybringer]));
    expect(offered).not.toContain(other);
    expect(zone(game, shivan)).toBe("hand");
    expect(zone(game, glorybringer)).toBe("hand");
    // The search's own rule: two Shivan Dragons together aren't an answer.
    expect(rule?.rule).toBe("distinct");
    expect(fitsTogether(rule!, [shivan, shivan2])).toBe(false);
    expect(fitsTogether(rule!, [shivan, glorybringer])).toBe(true);
  });
});

describe("Kastral, the Windcrested", () => {
  it("puts a Bird creature card from hand or graveyard onto the battlefield with a finality counter", () => {
    const { game, a } = table();
    const kastral = spawn(game, "Kastral, the Windcrested");
    const inHand = toHand(game, "Birds of Paradise");
    const inYard = toGraveyard(game, "Suntail Hawk");
    toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = pickFromZone(a, inHand);
    attack(game, a, [kastral]);
    // One choice over both zones.
    expect(seen.offered).toEqual(expect.arrayContaining([inHand, inYard]));
    expect(zone(game, inHand)).toBe("battlefield");
    expect(counters(game, inHand, "finality")).toBe(1);
    expect(zone(game, inYard)).toBe("graveyard");
  });
});
