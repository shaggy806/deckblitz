/**
 * Morningtide (MOR; B186), group A. One test per card whose behaviour is more
 * than a stat line or an exact copy of an already-tested pattern, on the clause
 * most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Greatbow Doyen", () => {
  it("pumps other Archers, and an Archer that damages a creature deals that much to its controller", () => {
    const { game, a, b } = table();
    const doyen = spawn(game, "Greatbow Doyen");
    const archer = spawn(game, "Lys Alana Bowmaster");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(pt(game, doyen)).toEqual({ power: 2, toughness: 4 });
    expect(pt(game, archer)).toEqual({ power: 3, toughness: 3 });
    b.declareBlockersFn = () => [{ blocker: bears, attacker: archer }];
    attack(game, a, [archer]);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    // The Archer dealt 3 to the Bears, so it deals 3 to the Bears' controller.
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("Stomping Slabs", () => {
  it("deals 7 damage when a card named Stomping Slabs is among the revealed seven", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const other = toLibrary(game, "Stomping Slabs");
    cast(game, toHand(game, "Stomping Slabs"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(13);
    // Every revealed card went to the bottom.
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-7)).toContain(other);
  });

  it("deals no damage when none was revealed", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Stomping Slabs"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
  });
});

describe("Spitebellows", () => {
  it("cast for evoke, it's sacrificed and its leaves trigger deals 6 to the target creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const card = toHand(game, "Spitebellows");
    cast(game, card, { evoke: true });
    expect(zone(game, card)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Lunk Errant", () => {
  it("gets +1/+1 and trample only when it attacks alone", () => {
    const { game, a } = table();
    const lunk = spawn(game, "Lunk Errant");
    attack(game, a, [lunk]);
    expect(pt(game, lunk)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, lunk).has("trample")).toBe(true);
  });

  it("does nothing when another creature attacks too", () => {
    const { game, a } = table();
    const lunk = spawn(game, "Lunk Errant");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [lunk, bears]);
    expect(pt(game, lunk)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, lunk).has("trample")).toBe(false);
  });
});

describe("Stonybrook Schoolmaster", () => {
  it("may make a Merfolk Wizard when it becomes tapped", () => {
    const { game, a } = table();
    const master = spawn(game, "Stonybrook Schoolmaster");
    pickModes(a, 0);
    attack(game, a, [master]);
    expect(tokensNamed(game, "Merfolk Wizard Token", A)).toBe(1);
  });
});

describe("Everbark Shaman", () => {
  it("exiles a Treefolk card from the graveyard to fetch two Forests tapped", () => {
    const { game, a } = table({ deck: "Forest" });
    const shaman = spawn(game, "Everbark Shaman");
    const treefolk = toGraveyard(game, "Everbark Shaman");
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 2);
    const before = named(game, "Forest", A).filter((id) => zone(game, id) === "battlefield").length;
    activate(game, shaman, 0);
    expect(zone(game, treefolk)).toBe("exile");
    const forests = named(game, "Forest", A).filter((id) => zone(game, id) === "battlefield");
    expect(forests.length).toBe(before + 2);
    expect(forests.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("can't be activated without a Treefolk card in the graveyard", () => {
    const { game } = table({ deck: "Forest" });
    const shaman = spawn(game, "Everbark Shaman");
    toGraveyard(game, "Grizzly Bears");
    expect(() => activate(game, shaman, 0)).toThrow();
  });
});

describe("Sage's Dousing", () => {
  it("counters a spell whose controller can't pay {3}, and draws with a Wizard", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Island", 3);
    spawn(game, "Stonybrook Schoolmaster");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const dousing = toHand(game, "Sage's Dousing");
    const before = hand(game, A).length;
    cast(game, dousing, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    // The Dousing left the hand and a card was drawn.
    expect(hand(game, A).length).toBe(before);
    expect(graveyard(game, A)).toContain(dousing);
  });
});

describe("Vengeful Firebrand", () => {
  it("has haste only while a Warrior card is in your graveyard", () => {
    const { game } = table();
    const firebrand = spawn(game, "Vengeful Firebrand");
    expect(keywords(game, firebrand).has("haste")).toBe(false);
    toGraveyard(game, "Lunk Errant");
    expect(keywords(game, firebrand).has("haste")).toBe(true);
  });
});

describe("Borderland Behemoth", () => {
  it("gets +4/+4 for each other Giant you control, not an opponent's", () => {
    const { game } = table();
    const behemoth = spawn(game, "Borderland Behemoth");
    spawn(game, "Lunk Errant");
    spawn(game, "Lunk Errant");
    spawn(game, "Lunk Errant", B);
    expect(pt(game, behemoth)).toEqual({ power: 12, toughness: 12 });
  });
});

describe("Lys Alana Bowmaster", () => {
  it("casting an Elf spell may have it deal 2 to a creature with flying", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    spawn(game, "Lys Alana Bowmaster");
    const crow = spawn(game, "Storm Crow", B);
    pickTargets(a, crow);
    pickModes(a, 0);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(zone(game, crow)).toBe("graveyard");
  });
});
