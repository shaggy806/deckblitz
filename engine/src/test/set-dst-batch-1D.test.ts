/**
 * Darksteel (DST), batch 1, part D (2026-10-27). Written on the shared table
 * in `harness.ts`, each from the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

/** Answer every choose-from-zone with whichever of `ids` are eligible. */
function pickEach(seat: ReturnType<typeof table>["a"], ...ids: readonly ObjectId[]): void {
  seat.chooseFromZoneFn = (_view, eligible) => ids.filter((id) => eligible.includes(id));
}

describe("Pulse of the Tangle", () => {
  it("returns to its owner's hand when an opponent controls more creatures after the token", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Pulse of the Tangle");
    cast(game, card);
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(1);
    expect(zone(game, card)).toBe("hand");
  });

  it("goes to the graveyard when no opponent controls more creatures than you", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Pulse of the Tangle");
    cast(game, card);
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(1);
    expect(zone(game, card)).toBe("graveyard");
  });
});

describe("Specter's Shroud", () => {
  it("gives +1/+0, and the equipped creature's combat damage to a player makes that player discard", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    const shroud = spawn(game, "Specter's Shroud");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, shroud, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    const before = hand(game, B).length;
    attack(game, a, [bears]);
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Auriok Glaivemaster", () => {
  it("is a 2/2 first striker only while equipped", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const glaive = spawn(game, "Auriok Glaivemaster");
    expect(pt(game, glaive)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, glaive).has("first-strike")).toBe(false);
    const shroud = spawn(game, "Specter's Shroud");
    activate(game, shroud, 0, { targets: [ref(glaive)] });
    expect(pt(game, glaive)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, glaive).has("first-strike")).toBe(true);
  });
});

describe("Steelshaper Apprentice", () => {
  it("returns itself to hand as a cost and finds an Equipment card", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const shroud = toLibrary(game, "Specter's Shroud");
    const apprentice = spawn(game, "Steelshaper Apprentice");
    pickEach(a, shroud);
    activate(game, apprentice, 0);
    expect(zone(game, apprentice)).toBe("hand");
    expect(zone(game, shroud)).toBe("hand");
  });
});

describe("Quicksilver Behemoth", () => {
  it("costs {1} less for each artifact you control", () => {
    const { game } = table();
    lands(game, "Island", 4);
    for (let i = 0; i < 3; i++) spawn(game, "Darksteel Brute");
    const card = toHand(game, "Quicksilver Behemoth");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
  });

  it("returns to its owner's hand at end of combat after attacking", () => {
    const { game, a } = table();
    const behemoth = spawn(game, "Quicksilver Behemoth");
    attack(game, a, [behemoth]);
    expect(zone(game, behemoth)).toBe("hand");
  });
});

describe("Tangle Golem", () => {
  it("costs {1} less for each Forest you control", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Wastes", 1);
    const card = toHand(game, "Tangle Golem");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
  });
});

describe("Stand Together", () => {
  it("puts two +1/+1 counters on each of two different creatures", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Stand Together"), { targets: [ref(one), ref(two)] });
    expect(counters(game, one)).toBe(2);
    expect(counters(game, two)).toBe(2);
  });

  it("can't target the same creature twice", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const one = spawn(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Stand Together"), { targets: [ref(one), ref(one)] })).toThrow();
  });
});

describe("Neurok Prodigy", () => {
  it("returns to hand by discarding an artifact card", () => {
    const { game } = table();
    const prodigy = spawn(game, "Neurok Prodigy");
    const brute = toHand(game, "Darksteel Brute");
    activate(game, prodigy, 0);
    expect(zone(game, prodigy)).toBe("hand");
    expect(graveyard(game)).toContain(brute);
  });
});

describe("Darksteel Brute", () => {
  it("becomes a 2/2 Beast artifact creature until end of turn", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const brute = spawn(game, "Darksteel Brute");
    activate(game, brute, 0);
    expect(types(game, brute)).toContain("creature");
    expect(pt(game, brute)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "upkeep", B);
    expect(types(game, brute)).not.toContain("creature");
  });
});

describe("Myr Landshaper", () => {
  it("makes target land an artifact until end of turn", () => {
    const { game } = table();
    const forest = spawn(game, "Forest", B);
    const myr = spawn(game, "Myr Landshaper");
    activate(game, myr, 0, { targets: [ref(forest)] });
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "artifact"]));
    toStep(game, "upkeep", B);
    expect(types(game, forest)).not.toContain("artifact");
  });
});
