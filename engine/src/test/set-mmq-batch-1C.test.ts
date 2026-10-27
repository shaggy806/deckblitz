import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  graveyard,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  ref,
  spawn,
  enter,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Mercadian Masques / Urza's Destiny / Starter 1999, group C", () => {
  it("Scent of Cinder deals damage equal to the red cards revealed from hand", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const bolt1 = toHand(game, "Lightning Bolt");
    const bolt2 = toHand(game, "Lightning Bolt");
    const island = toHand(game, "Island");
    const scent = toHand(game, "Scent of Cinder");
    pickTargets(a, B);
    const seen = pickFromZone(a, bolt1, bolt2);
    cast(game, scent, { targets: [ref(B)] });
    expect(seen.offered).toContain(bolt1);
    expect(seen.offered).not.toContain(island);
    expect(life(game, B)).toBe(18);
    expect(zone(game, bolt1)).toBe("hand");
  });

  it("Statecraft prevents combat damage dealt to and by your creatures", () => {
    const { game, a, b } = table();
    spawn(game, "Statecraft");
    const blocked = spawn(game, "Hill Giant");
    const unblocked = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: blocked }];
    a.declareAttackersFn = () => [
      { attacker: blocked, defender: B },
      { attacker: unblocked, defender: B },
    ];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[blocked].damageMarked).toBe(0);
  });

  it("Statecraft leaves noncombat damage alone", () => {
    const { game } = table();
    spawn(game, "Statecraft");
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Honor the Fallen exiles creature cards from every graveyard and gains that much life", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const mine = toGraveyard(game, "Grizzly Bears");
    const theirs1 = toGraveyard(game, "Grizzly Bears", B);
    const theirs2 = toGraveyard(game, "Hill Giant", B);
    const shock = toGraveyard(game, "Shock", B);
    cast(game, toHand(game, "Honor the Fallen"));
    for (const id of [mine, theirs1, theirs2]) expect(zone(game, id)).toBe("exile");
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });

  it("Renounce gains 2 life for each permanent sacrificed", () => {
    const { game, a } = table();
    const [p1, p2] = lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const extra = spawn(game, "Wastes");
    pickPermanents(a, bears, extra);
    cast(game, toHand(game, "Renounce"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, extra)).toBe("graveyard");
    expect(zone(game, p1!)).toBe("battlefield");
    expect(zone(game, p2!)).toBe("battlefield");
    expect(life(game, A)).toBe(24);
  });

  it("Worry Beads mills the player whose upkeep it is", () => {
    const { game } = table();
    spawn(game, "Worry Beads");
    nextTurn(game);
    expect(graveyard(game, B).length).toBe(1);
    expect(graveyard(game, A).length).toBe(0);
  });

  it("Soothsaying's {X} looks at exactly the top X cards", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const soothsaying = spawn(game, "Soothsaying");
    const deep = toLibrary(game, "Hill Giant");
    const second = toLibrary(game, "Shock");
    const top = toLibrary(game, "Lightning Bolt");
    const seen = pickFromZone(a, second, top);
    activate(game, soothsaying, 1, { x: 2 });
    expect([...seen.offered].sort()).toEqual([second, top].sort());
    expect(seen.offered).not.toContain(deep);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(0, 2).every((id) => id === second || id === top) || library.slice(-2).every((id) => id === second || id === top)).toBe(true);
  });

  it("General's Regalia sends the chosen source's next damage to you onto your creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 3);
    const regalia = spawn(game, "General's Regalia");
    const bears = spawn(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(A)], settle: false });
    pickPermanents(a, bolt);
    activate(game, regalia, 0, { targets: [ref(bears)] });
    expect(life(game, A)).toBe(20);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Tectonic Break makes each player sacrifice X lands", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Wastes", 2, B);
    cast(game, toHand(game, "Tectonic Break"), { x: 1 });
    expect(named(game, "Mountain", A).length).toBe(2);
    expect(named(game, "Wastes", B).length).toBe(1);
  });

  it("Hired Giant lets each other player fetch a land", () => {
    const { game, b } = table();
    pickModes(b, 0);
    b.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const before = named(game, "Wastes", A).length;
    enter(game, "Hired Giant");
    expect(named(game, "Wastes", B).length).toBe(1);
    expect(named(game, "Wastes", A).length).toBe(before);
  });
});
