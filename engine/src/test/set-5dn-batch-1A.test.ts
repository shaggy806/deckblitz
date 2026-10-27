import { describe, expect, it } from "vitest";
import {
  A,
  activate,
  cast,
  destroy,
  enter,
  keywords,
  lands,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

// Fifth Dawn (5DN), batch 213 group A.

describe("Guardian Idol", () => {
  it("enters tapped and becomes a 2/2 Golem artifact creature until end of turn", () => {
    const { game } = table();
    const idol = enter(game, "Guardian Idol");
    expect(game.state.objects[idol].tapped).toBe(true);
    lands(game, "Wastes", 2);
    activate(game, idol, 1);
    expect(types(game, idol)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, idol)).toEqual(["Golem"]);
    expect(pt(game, idol)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "upkeep", A);
    expect(types(game, idol)).toEqual(["artifact"]);
  });
});

describe("Desecration Elemental", () => {
  it("makes its controller sacrifice a creature when they cast a spell, itself if it's the only one", () => {
    const { game } = table();
    const elemental = spawn(game, "Desecration Elemental");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, elemental)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Chimeric Coils", () => {
  it("stays an X/X Construct past the turn's combat and is sacrificed at the next end step", () => {
    const { game } = table();
    const coils = spawn(game, "Chimeric Coils");
    lands(game, "Wastes", 4);
    activate(game, coils, 0, { x: 3 });
    expect(pt(game, coils)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, coils)).toEqual(["Construct"]);
    toStep(game, "postcombat-main");
    expect(types(game, coils)).toContain("creature");
    toStep(game, "end");
    settle(game);
    expect(zone(game, coils)).toBe("graveyard");
  });
});

describe("All Suns' Dawn", () => {
  it("returns one target card per color, then exiles itself", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const white = toGraveyard(game, "Waxmane Baku");
    const green = toGraveyard(game, "Grizzly Bears");
    const dawn = toHand(game, "All Suns' Dawn");
    cast(game, dawn, { targets: [ref(white), null, null, null, ref(green)] });
    expect(zone(game, white)).toBe("hand");
    expect(zone(game, green)).toBe("hand");
    expect(zone(game, dawn)).toBe("exile");
  });
});

describe("Synod Centurion", () => {
  it("is sacrificed once you control no other artifacts", () => {
    const { game } = table();
    const centurion = spawn(game, "Synod Centurion");
    const ring = spawn(game, "Sol Ring");
    settle(game);
    expect(zone(game, centurion)).toBe("battlefield");
    destroy(game, ring);
    settle(game);
    expect(zone(game, centurion)).toBe("graveyard");
  });
});

describe("Helm of Kaldra", () => {
  it("gives the equipped creature first strike, trample and haste, and makes no Kaldra without the other two", () => {
    const { game } = table();
    const helm = spawn(game, "Helm of Kaldra");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, helm, 1, { targets: [ref(bears)] });
    const kw = keywords(game, bears);
    expect(["first-strike", "trample", "haste"].every((k) => kw.has(k))).toBe(true);
    activate(game, helm, 0);
    expect(tokensNamed(game, "Kaldra")).toBe(0);
  });
});
