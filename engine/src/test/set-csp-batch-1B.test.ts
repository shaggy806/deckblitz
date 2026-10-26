/**
 * Coldsnap (CSP), group B: snow costs and counts (Skred, Scrying Sheets),
 * ice counters gating a static (Woolly Razorback), a hybrid cumulative upkeep
 * with a last-known-information dies count (Jötun Owl Keeper), "1 plus the
 * number named ~ in all graveyards" (Feast of Flesh, Kjeldoran War Cry), an
 * any-of-three-subtypes lord (Lovisa Coldeyes), Cryoclasm, Lightning Serpent,
 * Karplusan Wolverine and Soul Spike's pitch cost.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  enter,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
  activate,
} from "./harness.js";

describe("CSP batch 1B", () => {
  it("Skred deals damage equal to the snow permanents you control", () => {
    const { game } = table();
    lands(game, "Snow-Covered Mountain", 2);
    spawn(game, "Chilling Shade");
    spawn(game, "Mountain");
    spawn(game, "Snow-Covered Mountain", B);
    const wurm = spawn(game, "Craw Wurm", B);
    // Three snow permanents of alice's (two lands and the Shade); bob's isn't counted.
    cast(game, toHand(game, "Skred"), { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].damageMarked).toBe(3);
  });

  it("Scrying Sheets takes a snow card from the top, and leaves a nonsnow one", () => {
    const { game, a } = table();
    const sheets = spawn(game, "Scrying Sheets");
    lands(game, "Snow-Covered Forest", 2);
    const top = toLibrary(game, "Snow-Covered Island");
    pickFromZone(a, top);
    activate(game, sheets, 1);
    expect(zone(game, top)).toBe("hand");
    nextTurn(game);
    nextTurn(game);
    const wastes = toLibrary(game, "Wastes");
    // A nonsnow card can't be taken: nothing is offered.
    pickFromZone(a);
    activate(game, sheets, 1);
    expect(zone(game, wastes)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(wastes);
  });

  it("Woolly Razorback: no combat damage while it has ice; the block that melts the last one deals it", () => {
    const { game, a, b } = table();
    const boar = enter(game, "Woolly Razorback");
    expect(counters(game, boar, "ice")).toBe(3);
    expect(keywords(game, boar).has("defender")).toBe(true);
    const wurm = spawn(game, "Craw Wurm", B);
    a.declareBlockersFn = () => [{ blocker: boar, attacker: wurm }];
    // First block: two counters left, its damage prevented; the Wurm's isn't.
    nextTurn(game);
    attack(game, b, [wurm], A);
    expect(counters(game, boar, "ice")).toBe(2);
    expect(game.state.objects[wurm].damageMarked).toBe(0);
    expect(game.state.objects[boar].damageMarked).toBe(6);
    game.state.objects[boar].counters.ice = 1;
    nextTurn(game);
    nextTurn(game);
    attack(game, b, [wurm], A);
    expect(counters(game, boar, "ice")).toBe(0);
    expect(keywords(game, boar).has("defender")).toBe(false);
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("Jötun Owl Keeper pays {W} or {U} per counter, and leaves a Bird per age counter", () => {
    const { game, a } = table();
    const keeper = spawn(game, "Jötun Owl Keeper");
    spawn(game, "Plains");
    spawn(game, "Island");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, keeper, "age")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    // Two counters, paid with one Plains and one Island.
    expect(counters(game, keeper, "age")).toBe(2);
    expect(zone(game, keeper)).toBe("battlefield");
    destroy(game, keeper);
    expect(zone(game, keeper)).toBe("graveyard");
    expect(tokensNamed(game, "Bird Token", A)).toBe(2);
  });

  it("Feast of Flesh counts the copies in every graveyard, but not itself", () => {
    const { game } = table();
    toGraveyard(game, "Feast of Flesh", B);
    const giant = spawn(game, "Craw Wurm", B);
    spawn(game, "Swamp");
    cast(game, toHand(game, "Feast of Flesh"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(life(game)).toBe(22);
  });

  it("Kjeldoran War Cry gives +X/+X to your creatures only", () => {
    const { game } = table();
    toGraveyard(game, "Kjeldoran War Cry", B);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Kjeldoran War Cry"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("Lovisa Coldeyes pumps every Berserker, any player's, and not herself", () => {
    const { game } = table();
    const lovisa = spawn(game, "Lovisa Coldeyes");
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, goblin)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, goblin).has("haste")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, lovisa)).toEqual({ power: 3, toughness: 3 });
  });

  it("Cryoclasm destroys an Island and deals 3 to its controller", () => {
    const { game } = table();
    const island = spawn(game, "Island", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Cryoclasm"), { targets: [ref(island)] });
    expect(zone(game, island)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("Lightning Serpent enters with X +1/+0 counters", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Lightning Serpent"), { x: 2 });
    const serpent = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Lightning Serpent")!;
    expect(pt(game, serpent)).toEqual({ power: 4, toughness: 1 });
  });

  it("Karplusan Wolverine pings when it becomes blocked", () => {
    const { game, a, b } = table();
    const wolverine = spawn(game, "Karplusan Wolverine");
    const wall = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: wolverine }];
    pickTargets(a, B);
    pickModes(a, 0);
    attack(game, a, [wolverine]);
    expect(life(game, B)).toBe(19);
  });

  it("Soul Spike can be cast by exiling two other black cards", () => {
    const { game, a } = table();
    const spike = toHand(game, "Soul Spike");
    const x = toHand(game, "Feast of Flesh");
    const y = toHand(game, "Feast of Flesh");
    pickFromZone(a, x, y);
    const before = hand(game).length;
    cast(game, spike, { targets: [ref(B)], altCost: true });
    expect(zone(game, x)).toBe("exile");
    expect(zone(game, y)).toBe("exile");
    expect(hand(game).length).toBe(before - 3);
    expect(life(game, B)).toBe(16);
    expect(life(game)).toBe(24);
  });
});
